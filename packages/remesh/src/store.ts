import { from, Observable, Observer, Subject, Subscription } from 'rxjs'

import { map } from 'rxjs/operators'

import {
  Args,
  internalToOriginalEvent,
  RemeshCommand,
  RemeshCommandAction,
  RemeshCommandContext,
  RemeshCommandOutput,
  RemeshDomain,
  RemeshDomainAction,
  RemeshDomainContext,
  RemeshDomainDefinition,
  RemeshDomainPreloadCommandContext,
  RemeshDomainPreloadOptions,
  RemeshEffect,
  RemeshEffectContext,
  RemeshAction,
  RemeshEvent,
  RemeshEventAction,
  RemeshEventContext,
  RemeshEventOptions,
  RemeshExtern,
  RemeshExternImpl,
  RemeshInjectedContext,
  RemeshQuery,
  RemeshQueryAction,
  RemeshQueryContext,
  RemeshState,
  RemeshStateItem,
  RemeshSubscribeOnlyEvent,
  Serializable,
  toValidRemeshDomainDefinition,
  VerifiedRemeshDomainDefinition,
  RemeshDomainPreloadQueryContext,
  getCommandTaskSet,
  DefaultStateValue,
} from './remesh'

import { createInspectorManager, InspectorType } from './inspector'

export type PreloadedState = Record<string, Serializable>

export type RemeshStore = ReturnType<typeof RemeshStore>

let uid = 0

export type RemeshStateStorage<T> = {
  id: number
  type: 'RemeshStateStorage'
  State: RemeshState<T>
  stateItem: RemeshStateItem<T>
  currentState: DefaultStateValue | T
  downstreamSet: Set<RemeshQueryStorage<any, any>>
}

export type RemeshQueryStorage<T extends Args<Serializable>, U> = {
  id: number
  type: 'RemeshQueryStorage'
  Query: RemeshQuery<T, U>
  arg: T[0]
  key: string
  currentValue: U
  upstreamSet: Set<RemeshQueryStorage<any, any> | RemeshStateStorage<any>>
  downstreamSet: Set<RemeshQueryStorage<any, any>>
  subject: Subject<U>
  observable: Observable<U>
  refCount: number
  status: 'default' | 'wip' | 'updated'
  wipUpstreamSet: Set<RemeshQueryStorage<any, any> | RemeshStateStorage<any>>
}

export type RemeshEventStorage<T extends Args, U> = {
  id: number
  type: 'RemeshEventStorage'
  Event: RemeshEvent<T, U>
  subject: Subject<T[0]>
  observable: Observable<U>
  refCount: number
}

export type RemeshDomainStorage<T extends RemeshDomainDefinition, U extends Args<Serializable>> = {
  id: number
  type: 'RemeshDomainStorage'
  Domain: RemeshDomain<T, U>
  key: string
  arg: U[0]
  domain: VerifiedRemeshDomainDefinition<T>
  domainContext: RemeshDomainContext
  domainAction: RemeshDomainAction<T, U>
  upstreamSet: Set<RemeshDomainStorage<any, any>>
  downstreamSet: Set<RemeshDomainStorage<any, any>>
  preloadOptionsList: RemeshDomainPreloadOptions<any>[]
  preloadedPromise?: Promise<void>
  preloadedState: PreloadedState
  effectList: RemeshEffect[]
  effectMap: Map<RemeshEffect, Subscription>
  stateMap: Map<RemeshStateItem<any>, RemeshStateStorage<any>>
  queryMap: Map<string, RemeshQueryStorage<any, any>>
  eventMap: Map<RemeshEvent<any, any>, RemeshEventStorage<any, any>>
  refCount: number
  ignited: boolean
  hasBeenPreloaded: boolean
  isDiscarding: boolean
}

export type RemeshExternStorage<T> = {
  id: number
  type: 'RemeshExternStorage'
  Extern: RemeshExtern<T>
  currentValue: T
}

export type RemeshStoreInspector = typeof RemeshStore

export type RemeshStoreOptions = {
  name?: string
  externs?: RemeshExternImpl<any>[]
  inspectors?: (RemeshStoreInspector | false | undefined | null)[]
  preloadedState?: PreloadedState
}

export const RemeshStore = (options?: RemeshStoreOptions) => {
  const config = {
    ...options,
  }

  const inspectorManager = createInspectorManager(config)

  const pendingEmitSet = new Set<RemeshQueryStorage<any, any> | RemeshEventAction<any, any>>()
  /**
   * Leaf means that the query storage has no downstream query storages
   */
  const pendingLeafSet = new Set<RemeshQueryStorage<any, any>>()
  const pendingClearSet = new Set<RemeshQueryStorage<any, any>>()

  const domainStorageMap = new Map<string, RemeshDomainStorage<any, any>>()

  const externStorageWeakMap = new WeakMap<RemeshExtern<any>, RemeshExternStorage<any>>()

  const getExternValue = <T>(Extern: RemeshExtern<T>): T => {
    for (const externImpl of config.externs ?? []) {
      if (externImpl.Extern === Extern) {
        return externImpl.value
      }
    }
    return Extern.default
  }

  const getExternStorage = <T>(Extern: RemeshExtern<T>): RemeshExternStorage<T> => {
    const externStorage = externStorageWeakMap.get(Extern)

    if (externStorage) {
      return externStorage
    }

    const currentValue = getExternValue(Extern)

    const currentExternStorage: RemeshExternStorage<T> = {
      id: uid++,
      type: 'RemeshExternStorage',
      Extern,
      currentValue,
    }

    externStorageWeakMap.set(Extern, currentExternStorage)

    return currentExternStorage
  }

  const getExternCurrentValue = <T>(Extern: RemeshExtern<T>): T => {
    return getExternStorage(Extern).currentValue
  }

  const storageKeyWeakMap = new WeakMap<RemeshDomainAction<any, any> | RemeshQueryAction<any, any>, string>()

  const getQueryStorageKey = <T extends Args<Serializable>, U>(queryAction: RemeshQueryAction<T, U>): string => {
    const key = storageKeyWeakMap.get(queryAction)

    if (key) {
      return key
    }

    const queryName = queryAction.Query.queryName
    const argString = JSON.stringify(queryAction.arg) ?? ''
    const keyString = `Query/${queryAction.Query.queryId}/${queryName}:${argString}`

    storageKeyWeakMap.set(queryAction, keyString)

    return keyString
  }

  const getDomainStorageKey = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ): string => {
    const key = storageKeyWeakMap.get(domainAction)

    if (key) {
      return key
    }

    const domainName = domainAction.Domain.domainName
    const argString = JSON.stringify(domainAction.arg) ?? ''
    const keyString = `Domain/${domainAction.Domain.domainId}/${domainName}:${argString}`

    storageKeyWeakMap.set(domainAction, keyString)

    return keyString
  }

  const getStorageKey = <T extends Args<Serializable>, U>(
    input: RemeshQueryAction<T, U> | RemeshDomainAction<RemeshDomainDefinition, any>,
  ): string => {
    if (input.type === 'RemeshQueryAction') {
      return getQueryStorageKey(input)
    }
    return getDomainStorageKey(input)
  }

  const stateStorageWeakMap = new WeakMap<RemeshStateItem<any>, RemeshStateStorage<any>>()

  const getStateValue = <T>(State: RemeshState<T>) => {
    if (typeof State.default === 'function') {
      return (State.default as () => T)()
    }
    return State.default
  }

  const createStateStorage = <T>(stateItem: RemeshStateItem<T>): RemeshStateStorage<T> => {
    const domainStorage = getDomainStorage(stateItem.State.owner)

    const currentState = getStateValue(stateItem.State)

    const stateStorage: RemeshStateStorage<T> = {
      id: uid++,
      type: 'RemeshStateStorage',
      State: stateItem.State,
      stateItem,
      currentState,
      downstreamSet: new Set(),
    }

    domainStorage.stateMap.set(stateItem, stateStorage)
    stateStorageWeakMap.set(stateItem, stateStorage)

    inspectorManager.inspectStateStorage(InspectorType.StateCreated, stateStorage)

    return stateStorage
  }

  const restoreStateStorage = <T>(stateStorage: RemeshStateStorage<T>) => {
    const domainStorage = getDomainStorage(stateStorage.State.owner)

    if (domainStorage.stateMap.has(stateStorage.stateItem)) {
      return
    }

    stateStorage.currentState = getStateValue(stateStorage.State)
    domainStorage.stateMap.set(stateStorage.stateItem, stateStorage)
    inspectorManager.inspectStateStorage(InspectorType.StateReused, stateStorage)
  }

  const getStateStorage = <T>(stateItem: RemeshStateItem<T>): RemeshStateStorage<T> => {
    const domainStorage = getDomainStorage(stateItem.State.owner)
    const stateStorage = domainStorage.stateMap.get(stateItem)

    if (stateStorage) {
      return stateStorage as RemeshStateStorage<T>
    }

    const cachedStorage = stateStorageWeakMap.get(stateItem)

    if (cachedStorage) {
      restoreStateStorage(cachedStorage)
      return cachedStorage
    }

    return createStateStorage(stateItem)
  }

  const eventStorageWeakMap = new WeakMap<RemeshEvent<any, any>, RemeshEventStorage<any, any>>()

  const createEventStorage = <T extends Args, U>(Event: RemeshEvent<T, U>): RemeshEventStorage<T, U> => {
    const domainStorage = getDomainStorage(Event.owner)

    const eventContext: RemeshEventContext = {
      get: remeshInjectedContext.get,
    }

    const subject = new Subject<T>()

    const observableMapToImplIfNeeded = subject.pipe(
      map((arg) => {
        if (Event.impl) {
          return Event.impl(eventContext, arg)
        }
        return arg as unknown as U
      }),
    )

    const observable = new Observable<U>((subscriber) => {
      const subscription = observableMapToImplIfNeeded.subscribe(subscriber)
      eventStorage.refCount += 1
      return () => {
        eventStorage.refCount -= 1
        subscription.unsubscribe()
        if (eventStorage.refCount === 0) {
          clearEventStorageIfNeeded(eventStorage)
        }
      }
    })

    const cachedStorage = eventStorageWeakMap.get(Event)

    const eventStorage = Object.assign(cachedStorage ?? {}, {
      id: uid++,
      type: 'RemeshEventStorage',
      Event,
      subject,
      observable,
      refCount: 0,
    } as RemeshEventStorage<T, U>)

    domainStorage.eventMap.set(Event, eventStorage)
    eventStorageWeakMap.set(Event, eventStorage)

    return eventStorage
  }

  const getEventStorage = <T extends Args, U>(Event: RemeshEvent<T, U>): RemeshEventStorage<T, U> => {
    const domainStorage = getDomainStorage(Event.owner)
    const eventStorage = domainStorage.eventMap.get(Event) ?? createEventStorage(Event)

    return eventStorage as RemeshEventStorage<T, U>
  }

  const queryStorageWeakMap = new WeakMap<RemeshQueryAction<any, any>, RemeshQueryStorage<any, any>>()

  const createQueryStorage = <T extends Args<Serializable>, U>(
    queryAction: RemeshQueryAction<T, U>,
  ): RemeshQueryStorage<T, U> => {
    const domainStorage = getDomainStorage(queryAction.Query.owner)
    const key = getQueryStorageKey(queryAction)

    const subject = new Subject<U>()
    const observable = subject.asObservable()
    const upstreamSet: RemeshQueryStorage<T, U>['upstreamSet'] = new Set()

    const currentQueryStorage = {
      id: uid++,
      type: 'RemeshQueryStorage',
      Query: queryAction.Query,
      arg: queryAction.arg,
      key,
      upstreamSet,
      downstreamSet: new Set(),
      subject,
      observable,
      refCount: 0,
      status: 'default',
      wipUpstreamSet: new Set(),
    } as RemeshQueryStorage<T, U>

    const { Query } = queryAction

    const queryContext: RemeshQueryContext = {
      get: (input: RemeshStateItem<any> | RemeshQueryAction<any, any>) => {
        if (currentQueryStorage.upstreamSet !== upstreamSet) {
          return remeshInjectedContext.get(input)
        }

        if (input.type === 'RemeshStateItem') {
          const upstreamStateStorage = getStateStorage(input)

          currentQueryStorage.upstreamSet.add(upstreamStateStorage)
          upstreamStateStorage.downstreamSet.add(currentQueryStorage)

          return remeshInjectedContext.get(input)
        }

        if (input.type === 'RemeshQueryAction') {
          const upstreamQueryStorage = getQueryStorage(input)

          currentQueryStorage.upstreamSet.add(upstreamQueryStorage)
          upstreamQueryStorage.downstreamSet.add(currentQueryStorage)

          return remeshInjectedContext.get(input)
        }

        return remeshInjectedContext.get(input)
      },
    }

    const currentValue = Query.impl(queryContext, queryAction.arg)

    currentQueryStorage.currentValue = currentValue

    domainStorage.queryMap.set(key, currentQueryStorage)
    queryStorageWeakMap.set(queryAction, currentQueryStorage)

    inspectorManager.inspectQueryStorage(InspectorType.QueryCreated, currentQueryStorage)

    return currentQueryStorage
  }

  const restoreQueryStorage = <T extends Args<Serializable>, U>(queryStorage: RemeshQueryStorage<T, U>) => {
    const domainStorage = getDomainStorage(queryStorage.Query.owner)

    if (domainStorage.queryMap.has(queryStorage.key)) {
      return
    }

    const subject = new Subject<U>()
    const observable = subject.asObservable()

    queryStorage.status = 'default'
    queryStorage.subject = subject
    queryStorage.observable = observable
    domainStorage.queryMap.set(queryStorage.key, queryStorage)

    for (const upstream of queryStorage.upstreamSet) {
      upstream.downstreamSet.add(queryStorage)
      if (upstream.type === 'RemeshQueryStorage') {
        restoreQueryStorage(upstream)
      } else if (upstream.type === 'RemeshStateStorage') {
        restoreStateStorage(upstream)
      } else {
        throw new Error(`Unknown upstream: ${upstream}`)
      }
    }

    updateQueryStorage(queryStorage)
    inspectorManager.inspectQueryStorage(InspectorType.QueryReused, queryStorage)
  }

  const getQueryStorage = <T extends Args<Serializable>, U>(
    queryAction: RemeshQueryAction<T, U>,
  ): RemeshQueryStorage<T, U> => {
    const domainStorage = getDomainStorage(queryAction.Query.owner)
    const key = getQueryStorageKey(queryAction)
    const queryStorage = domainStorage.queryMap.get(key)

    if (queryStorage) {
      return queryStorage
    }

    const cachedStorage = queryStorageWeakMap.get(queryAction)

    if (cachedStorage) {
      restoreQueryStorage(cachedStorage)
      return cachedStorage
    }

    return createQueryStorage(queryAction)
  }

  const getQueryStorageObservable = <T extends Args<Serializable>, U>(
    queryAction: RemeshQueryAction<T, U>,
  ): Observable<U> => {
    const queryStorage = getQueryStorage(queryAction)

    return new Observable<U>((subscriber) => {
      const subscription = queryStorage.subject.subscribe(subscriber)
      queryStorage.refCount += 1

      return () => {
        queryStorage.refCount -= 1
        subscription.unsubscribe()
        if (queryStorage.refCount === 0) {
          clearQueryStorageIfNeeded(queryStorage)
        }
      }
    })
  }

  const domainStorageWeakMap = new WeakMap<RemeshDomainAction<any, any>, RemeshDomainStorage<any, any>>()

  const createDomainStorage = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ): RemeshDomainStorage<T, U> => {
    const key = getDomainStorageKey(domainAction)

    const upstreamSet: RemeshDomainStorage<T, U>['upstreamSet'] = new Set()

    const domainContext: RemeshDomainContext = {
      state: (options) => {
        const State = RemeshState(options)
        State.owner = domainAction
        return State
      },
      query: (options) => {
        const Query = RemeshQuery(options)
        Query.owner = domainAction
        return Query
      },
      event: (options: Omit<RemeshEventOptions<any, any>, 'impl'> | RemeshEventOptions<any, any>) => {
        const Event = RemeshEvent(options)
        Event.owner = domainAction
        return Event as RemeshEvent<any, any>
      },
      command: (options) => {
        const Command = RemeshCommand(options)
        Command.owner = domainAction
        return Command
      },
      effect: (effect) => {
        if (!currentDomainStorage.ignited) {
          currentDomainStorage.effectList.push(effect)
        }
      },
      preload: (preloadOptions) => {
        if (!currentDomainStorage.ignited) {
          currentDomainStorage.preloadOptionsList.push(preloadOptions)
        }
      },
      getDomain: (upstreamDomainAction) => {
        const upstreamDomainStorage = getDomainStorage(upstreamDomainAction)

        upstreamSet.add(upstreamDomainStorage)
        upstreamDomainStorage.downstreamSet.add(currentDomainStorage)

        if (currentDomainStorage.ignited) {
          igniteDomain(upstreamDomainAction)
        }

        return upstreamDomainStorage.domain
      },
      forgetDomain: (upstreamDomainAction) => {
        const upstreamDomainStorage = getDomainStorage(upstreamDomainAction)

        upstreamSet.delete(upstreamDomainStorage)
        upstreamDomainStorage.downstreamSet.delete(currentDomainStorage)

        clearDomainStorageIfNeeded(upstreamDomainStorage)
      },
      getExtern: (Extern) => {
        return getExternCurrentValue(Extern)
      },
    }

    const currentDomainStorage: RemeshDomainStorage<T, U> = {
      id: uid++,
      type: 'RemeshDomainStorage',
      Domain: domainAction.Domain,
      get domain() {
        return domain
      },
      arg: domainAction.arg,
      domainContext,
      domainAction,
      key,
      upstreamSet,
      downstreamSet: new Set(),
      effectList: [],
      stateMap: new Map(),
      queryMap: new Map(),
      eventMap: new Map(),
      effectMap: new Map(),
      preloadOptionsList: [],
      preloadedState: {},
      refCount: 0,
      ignited: false,
      hasBeenPreloaded: false,
      isDiscarding: false,
    }

    const domain = toValidRemeshDomainDefinition(domainAction.Domain.impl(domainContext, domainAction.arg))

    domainStorageMap.set(key, currentDomainStorage)
    domainStorageWeakMap.set(domainAction, currentDomainStorage)

    inspectorManager.inspectDomainStorage(InspectorType.DomainCreated, currentDomainStorage)

    injectPreloadState(currentDomainStorage)

    return currentDomainStorage
  }

  const injectPreloadState = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainStorage: RemeshDomainStorage<T, U>,
  ) => {
    if (!options?.preloadedState) {
      return
    }

    const preloadCommandContext = {
      get: remeshInjectedContext.get,
    }

    for (const preloadOptions of domainStorage.preloadOptionsList) {
      if (Object.prototype.hasOwnProperty.call(options.preloadedState, preloadOptions.key)) {
        const data = options.preloadedState[preloadOptions.key]
        handleCommandOutput(preloadOptions.command(preloadCommandContext, data))
      }
    }
  }

  const getDomainStorage = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ): RemeshDomainStorage<T, U> => {
    const key = getDomainStorageKey(domainAction)
    const domainStorage = domainStorageMap.get(key)

    if (domainStorage) {
      domainStorageWeakMap.set(domainAction, domainStorage)
      return domainStorage
    }

    const cachedDomainStorage = domainStorageWeakMap.get(domainAction)

    if (cachedDomainStorage) {
      cachedDomainStorage.ignited = false
      cachedDomainStorage.isDiscarding = false
      domainStorageMap.set(cachedDomainStorage.key, cachedDomainStorage)

      for (const upstreamDomainStorage of cachedDomainStorage.upstreamSet) {
        upstreamDomainStorage.downstreamSet.add(cachedDomainStorage)
      }

      inspectorManager.inspectDomainStorage(InspectorType.DomainReused, cachedDomainStorage)
      return cachedDomainStorage
    }

    return createDomainStorage(domainAction)
  }

  const clearQueryStorage = <T extends Args<Serializable>, U>(queryStorage: RemeshQueryStorage<T, U>) => {
    const domainStorage = getDomainStorage(queryStorage.Query.owner)

    if (!domainStorage.queryMap.has(queryStorage.key)) {
      return
    }

    domainStorage.queryMap.delete(queryStorage.key)
    queryStorage.subject.complete()
    inspectorManager.inspectQueryStorage(InspectorType.QueryDiscarded, queryStorage)

    for (const upstreamStorage of queryStorage.upstreamSet) {
      if (!upstreamStorage.downstreamSet.has(queryStorage)) {
        continue
      }
      upstreamStorage.downstreamSet.delete(queryStorage)

      if (upstreamStorage.type === 'RemeshQueryStorage') {
        clearQueryStorageIfNeeded(upstreamStorage)
      }
    }

    clearDomainStorageIfNeeded(domainStorage)
  }

  const shouldClearQueryStorage = <T extends Args<Serializable>, U>(
    queryStorage: RemeshQueryStorage<T, U>,
  ): boolean => {
    if (queryStorage.refCount > 0) {
      return false
    }

    if (queryStorage.downstreamSet.size !== 0) {
      return false
    }

    return true
  }

  const clearQueryStorageIfNeeded = <T extends Args<Serializable>, U>(queryStorage: RemeshQueryStorage<T, U>) => {
    if (shouldClearQueryStorage(queryStorage)) {
      clearQueryStorage(queryStorage)
    }
  }

  const clearStateStorage = <T>(stateStorage: RemeshStateStorage<T>) => {
    const domainStorage = getDomainStorage(stateStorage.State.owner)

    if (!domainStorage.stateMap.has(stateStorage.stateItem)) {
      return
    }

    domainStorage.stateMap.delete(stateStorage.stateItem)
    stateStorage.downstreamSet.clear()
    inspectorManager.inspectStateStorage(InspectorType.StateDiscarded, stateStorage)
  }

  const clearEventStorage = <T extends Args, U>(eventStorage: RemeshEventStorage<T, U>) => {
    const domainStorage = getDomainStorage(eventStorage.Event.owner)

    eventStorage.subject.complete()
    domainStorage.eventMap.delete(eventStorage.Event)

    clearDomainStorageIfNeeded(domainStorage)
  }

  const shouldClearEventStorage = <T extends Args, U>(eventStorage: RemeshEventStorage<T, U>): boolean => {
    if (eventStorage.refCount > 0) {
      return false
    }
    return true
  }

  const clearEventStorageIfNeeded = <T extends Args, U>(eventStorage: RemeshEventStorage<T, U>) => {
    if (shouldClearEventStorage(eventStorage)) {
      clearEventStorage(eventStorage)
    }
  }

  const clearDomainStorage = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainStorage: RemeshDomainStorage<T, U>,
  ) => {
    if (domainStorage.isDiscarding) {
      return
    }

    domainStorage.isDiscarding = true
    domainStorage.ignited = false

    for (const subscription of domainStorage.effectMap.values()) {
      subscription.unsubscribe()
    }

    for (const eventStorage of domainStorage.eventMap.values()) {
      clearEventStorage(eventStorage)
    }

    for (const queryStorage of domainStorage.queryMap.values()) {
      clearQueryStorage(queryStorage)
    }

    for (const stateStorage of domainStorage.stateMap.values()) {
      clearStateStorage(stateStorage)
    }

    domainStorage.downstreamSet.clear()
    domainStorage.stateMap.clear()
    domainStorage.queryMap.clear()
    domainStorage.eventMap.clear()
    domainStorage.effectMap.clear()

    domainStorageMap.delete(domainStorage.key)

    inspectorManager.inspectDomainStorage(InspectorType.DomainDiscarded, domainStorage)

    for (const upstreamDomainStorage of domainStorage.upstreamSet) {
      if (!upstreamDomainStorage.downstreamSet.has(domainStorage)) {
        continue
      }
      upstreamDomainStorage.downstreamSet.delete(domainStorage)
      clearDomainStorageIfNeeded(upstreamDomainStorage)
    }
  }

  const shouldClearDomainStorage = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainStorage: RemeshDomainStorage<T, U>,
  ): boolean => {
    if (domainStorage.refCount > 0) {
      return false
    }

    if (domainStorage.isDiscarding) {
      return false
    }

    if (domainStorage.downstreamSet.size !== 0) {
      return false
    }

    /**
     * we only check the refCount of queryStorage and eventStorage
     * when their refCount is 0, it means there is no consumers outside of the domain
     * so the domain resources can be cleared
     */
    for (const queryStorage of domainStorage.queryMap.values()) {
      if (queryStorage.refCount > 0) {
        return false
      }
    }

    for (const eventStorage of domainStorage.eventMap.values()) {
      if (eventStorage.refCount > 0) {
        return false
      }
    }

    return true
  }

  const clearDomainStorageIfNeeded = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainStorage: RemeshDomainStorage<T, U>,
  ) => {
    if (shouldClearDomainStorage(domainStorage)) {
      clearDomainStorage(domainStorage)
    }
  }

  const getCurrentState = <T>(stateItem: RemeshStateItem<T>): T => {
    const stateStorage = getStateStorage(stateItem)

    if (stateStorage.currentState === DefaultStateValue) {
      throw new Error(`Unexpected reading domain.state before initializing: ${stateStorage.State.stateName}`)
    }

    return stateStorage.currentState
  }

  const getCurrentQueryValue = <T extends Args<Serializable>, U>(queryAction: RemeshQueryAction<T, U>): U => {
    const queryStorage = getQueryStorage(queryAction)

    updateWipQueryStorage(queryStorage)

    const currentValue = queryStorage.currentValue

    return currentValue
  }

  const remeshInjectedContext: RemeshInjectedContext = {
    get: (input: RemeshStateItem<any> | RemeshQueryAction<any, any>) => {
      if (input.type === 'RemeshStateItem') {
        return getCurrentState(input)
      }

      if (input.type === 'RemeshQueryAction') {
        return getCurrentQueryValue(input)
      }

      throw new Error(`Unexpected input in ctx.get(..): ${input}`)
    },
    fromEvent: (Event) => {
      if (Event.type === 'RemeshEvent') {
        const eventStorage = getEventStorage(Event)
        return eventStorage.observable
      } else if (Event.type === 'RemeshSubscribeOnlyEvent') {
        const OriginalEvent = internalToOriginalEvent(Event)
        const eventStorage = getEventStorage(OriginalEvent)
        return eventStorage.observable
      }

      throw new Error(`Unexpected input in fromEvent(..): ${Event}`)
    },
    fromQuery: (queryAction) => {
      return getQueryStorageObservable(queryAction)
    },
  }

  const updateWipQueryStorage = <T extends Args<Serializable>, U>(queryStorage: RemeshQueryStorage<T, U>) => {
    if (queryStorage.status !== 'wip') {
      return
    }

    if (queryStorage.wipUpstreamSet.size !== 0) {
      let shouldUpdate = false

      for (const upstream of queryStorage.wipUpstreamSet) {
        if (upstream.type === 'RemeshStateStorage') {
          shouldUpdate = true
        } else if (upstream.type === 'RemeshQueryStorage') {
          if (upstream.status === 'wip') {
            updateWipQueryStorage(upstream)
          }
          if (upstream.status === 'updated') {
            shouldUpdate = true
          }
        } else {
          throw new Error(`Unexpected upstream: ${upstream}`)
        }
      }

      queryStorage.wipUpstreamSet.clear()

      if (!shouldUpdate) {
        queryStorage.status = 'default'
        return
      }
    }

    const isUpdated = updateQueryStorage(queryStorage)

    if (isUpdated) {
      queryStorage.status = 'updated'
    } else {
      queryStorage.status = 'default'
    }
  }

  const updateQueryStorage = <T extends Args<Serializable>, U>(queryStorage: RemeshQueryStorage<T, U>) => {
    const { Query } = queryStorage

    for (const upstream of queryStorage.upstreamSet) {
      if (!upstream.downstreamSet.has(queryStorage)) {
        continue
      }
      upstream.downstreamSet.delete(queryStorage)
      if (upstream.downstreamSet.size === 0) {
        if (upstream.type !== 'RemeshStateStorage') {
          pendingClearSet.add(upstream)
        }
      }
    }

    const upstreamSet: RemeshQueryStorage<T, U>['upstreamSet'] = new Set()

    queryStorage.upstreamSet = upstreamSet

    const queryContext: RemeshQueryContext = {
      get: (input: RemeshStateItem<any> | RemeshQueryAction<any, any>) => {
        if (queryStorage.upstreamSet !== upstreamSet) {
          return remeshInjectedContext.get(input)
        }

        if (input.type === 'RemeshStateItem') {
          const upstreamStateStorage = getStateStorage(input)

          queryStorage.upstreamSet.add(upstreamStateStorage)
          upstreamStateStorage.downstreamSet.add(queryStorage)

          return remeshInjectedContext.get(input)
        }

        if (input.type === 'RemeshQueryAction') {
          const upstreamQueryStorage = getQueryStorage(input)

          queryStorage.upstreamSet.add(upstreamQueryStorage)
          upstreamQueryStorage.downstreamSet.add(queryStorage)

          return remeshInjectedContext.get(input)
        }

        return remeshInjectedContext.get(input)
      },
    }

    let newValue: U
    const currentValue = queryStorage.currentValue

    if (!Query.onError) {
      newValue = Query.impl(queryContext, queryStorage.arg)
    } else {
      try {
        newValue = Query.impl(queryContext, queryStorage.arg)
      } catch (e) {
        const error = e instanceof Error ? e : new Error(`${e}`)
        newValue = Query.onError(error, currentValue)
      }
    }

    const isEqual = Query.compare(currentValue, newValue)

    if (isEqual) {
      return false
    }

    queryStorage.currentValue = newValue
    pendingEmitSet.add(queryStorage)
    inspectorManager.inspectQueryStorage(InspectorType.QueryUpdated, queryStorage)

    const changedTaskSet = getCommandTaskSet(Query, 'changed')

    if (changedTaskSet) {
      const data = {
        current: newValue,
        previous: currentValue,
      }
      for (const task of changedTaskSet) {
        handleCommandOutput(task(commandContext, data))
      }
    }

    return true
  }

  const clearPendingStorageSetIfNeeded = () => {
    if (pendingClearSet.size === 0) {
      return
    }

    const storageList = [...pendingClearSet]

    pendingClearSet.clear()

    for (const storage of storageList) {
      clearQueryStorageIfNeeded(storage)
    }

    clearPendingStorageSetIfNeeded()
  }

  const clearPendingEmitSetIfNeeded = () => {
    if (pendingEmitSet.size === 0) {
      return
    }

    const list = [...pendingEmitSet]

    pendingEmitSet.clear()

    for (const item of list) {
      if (!pendingEmitSet.has(item)) {
        if (item.type === 'RemeshQueryStorage') {
          item.subject.next(item.currentValue)
        } else if (item.type === 'RemeshEventAction') {
          emitEvent(item)
        }
      }
    }

    /**
     * recursively consuming dynamic set until it become empty.
     */
    clearPendingEmitSetIfNeeded()
  }

  const mark = <T extends Args<Serializable>, U>(queryStorage: RemeshQueryStorage<T, U>) => {
    queryStorage.status = 'wip'

    if (queryStorage.downstreamSet.size > 0) {
      for (const downstream of queryStorage.downstreamSet) {
        if (!downstream.wipUpstreamSet.has(queryStorage)) {
          downstream.wipUpstreamSet.add(queryStorage)
          mark(downstream)
        }
      }
    } else {
      pendingLeafSet.add(queryStorage)
    }
  }

  const clearPendingLeafSetIfNeeded = () => {
    if (pendingLeafSet.size === 0) {
      return
    }

    const queryStorageList = [...pendingLeafSet]

    pendingLeafSet.clear()

    for (const queryStorage of queryStorageList) {
      updateWipQueryStorage(queryStorage)
    }

    /**
     * recursively consuming dynamic set until it become empty.
     */
    clearPendingLeafSetIfNeeded()
  }

  const commit = () => {
    clearPendingLeafSetIfNeeded()
    clearPendingStorageSetIfNeeded()
    clearPendingEmitSetIfNeeded()
  }

  const updateStateItem = <T>(stateItem: RemeshStateItem<T>, newState: T) => {
    const stateStorage = getStateStorage(stateItem)

    if (stateStorage.currentState !== DefaultStateValue) {
      const isEqual = stateItem.State.compare(stateStorage.currentState, newState)

      if (isEqual) {
        return
      }
    }

    stateStorage.currentState = newState

    inspectorManager.inspectStateStorage(InspectorType.StateUpdated, stateStorage)

    for (const downstream of stateStorage.downstreamSet) {
      downstream.wipUpstreamSet.add(stateStorage)
      mark(downstream)
    }
  }

  const emitEvent = <T extends Args, U>(eventAction: RemeshEventAction<T, U>) => {
    const { Event, arg } = eventAction
    const eventStorage = getEventStorage(Event)

    inspectorManager.inspectEventEmitted(InspectorType.EventEmitted, eventAction)

    eventStorage.subject.next(arg)
  }

  const commandContext: RemeshCommandContext = {
    get: remeshInjectedContext.get,
  }

  const handleCommandAction = <T extends Args>(commandAction: RemeshCommandAction<T>) => {
    inspectorManager.inspectCommandReceived(InspectorType.CommandReceived, commandAction)

    const { Command, arg } = commandAction

    const fn = Command.impl

    const beforeTaskSet = getCommandTaskSet(Command, 'before')

    if (beforeTaskSet) {
      for (const task of beforeTaskSet) {
        handleCommandOutput(task(commandContext, arg))
      }
    }

    handleCommandOutput(fn(commandContext, arg))

    const afterTaskSet = getCommandTaskSet(Command, 'after')

    if (afterTaskSet) {
      for (const task of afterTaskSet) {
        handleCommandOutput(task(commandContext, arg))
      }
    }
  }

  const handleCommandOutput = (output: RemeshCommandOutput) => {
    if (!output) {
      return
    }

    if (Array.isArray(output)) {
      for (const item of output) {
        handleCommandOutput(item)
      }
    } else if (output.type === 'RemeshCommandAction') {
      handleCommandAction(output)
    } else if (output.type === 'RemeshStateItemUpdatePayload') {
      updateStateItem(output.stateItem, output.value)
    } else if (output.type === 'RemeshEventAction') {
      handleRemeshEventAction(output)
    }
  }

  const handleRemeshEventAction = <T extends Args, U>(eventAction: RemeshEventAction<T, U>) => {
    const Event = eventAction.Event
    const emittedTaskSet = getCommandTaskSet(Event, 'emitted')

    pendingEmitSet.add(eventAction)

    if (emittedTaskSet) {
      for (const task of emittedTaskSet) {
        handleCommandOutput(task(commandContext, eventAction.arg))
      }
    }
  }

  const subscribeDomain = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ) => {
    const domainStorage = getDomainStorage(domainAction)

    if (domainStorage.refCount === 0) {
      for (const effect of domainStorage.effectList) {
        subscribeDomainEffect(domainStorage, effect)
      }
    }

    const subscription = new Subscription(() => {
      domainStorage.refCount -= 1
      if (domainStorage.refCount === 0) {
        for (const subscription of domainStorage.effectMap.values()) {
          subscription.unsubscribe()
        }
        domainStorage.effectMap.clear()
        clearDomainStorageIfNeeded(domainStorage)
      }
    })

    domainStorage.refCount += 1

    return subscription
  }

  const subscribeQuery = <T extends Args<Serializable>, U>(
    queryAction: RemeshQueryAction<T, U>,
    subscriber: ((data: U) => unknown) | Partial<Observer<U>>,
  ): Subscription => {
    const observable = getQueryStorageObservable(queryAction)
    if (typeof subscriber === 'function') {
      return observable.subscribe(subscriber)
    }

    return observable.subscribe(subscriber)
  }

  const subscribeEvent = <T extends Args, U>(
    Event: RemeshEvent<T, U> | RemeshSubscribeOnlyEvent<T, U>,
    subscriber: (event: U) => unknown,
  ): Subscription => {
    if (Event.type === 'RemeshEvent') {
      const eventStorage = getEventStorage(Event)
      return eventStorage.observable.subscribe(subscriber)
    } else if (Event.type === 'RemeshSubscribeOnlyEvent') {
      const OriginalEvent = internalToOriginalEvent(Event)
      return subscribeEvent(OriginalEvent, subscriber)
    }

    throw new Error(`Unknown event type of ${Event}`)
  }

  const getDomain = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ) => {
    const domainStorage = getDomainStorage(domainAction)
    return domainStorage.domain
  }

  const effectContext: RemeshEffectContext = {
    get: remeshInjectedContext.get,
    fromEvent: remeshInjectedContext.fromEvent,
    fromQuery: remeshInjectedContext.fromQuery,
  }

  const handleEffectOutput = (output: RemeshAction) => {
    handleCommandOutput(output)
    commit()
  }

  const igniteDomain = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ) => {
    const domainStorage = getDomainStorage(domainAction)

    if (domainStorage.ignited) {
      return
    }

    domainStorage.ignited = true

    for (const upstreamDomainStorage of domainStorage.upstreamSet) {
      igniteDomain(upstreamDomainStorage.domainAction)
    }
  }

  const subscribeDomainEffect = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainStorage: RemeshDomainStorage<T, U>,
    effect: RemeshEffect,
  ) => {
    const effectResult = effect.impl(effectContext)

    if (effectResult) {
      const subscription = from(effectResult).subscribe(handleEffectOutput)
      domainStorage.effectMap.set(effect, subscription)
    }
  }

  const discardDomain = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ) => {
    const domainStorage = getDomainStorage(domainAction)

    clearDomainStorage(domainStorage)
  }

  const discard = () => {
    inspectorManager.destroyInspectors()

    for (const domainStorage of domainStorageMap.values()) {
      clearDomainStorage(domainStorage)
    }
    domainStorageMap.clear()
    pendingEmitSet.clear()
  }

  const preload = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ) => {
    const domainStorage = getDomainStorage(domainAction)

    if (domainStorage.ignited) {
      throw new Error(`Domain ${domainAction.Domain.domainName} was ignited before preloading`)
    }

    if (domainStorage.preloadedPromise) {
      return domainStorage.preloadedPromise
    }

    const preloadedPromise = preloadDomain(domainAction)

    domainStorage.preloadedPromise = preloadedPromise

    return preloadedPromise
  }

  const domainPreloadCommandContext: RemeshDomainPreloadCommandContext = {
    get: remeshInjectedContext.get,
  }

  const domainPreloadQueryContext: RemeshDomainPreloadQueryContext = {
    get: remeshInjectedContext.get,
  }

  const preloadDomain = async <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ) => {
    const domainStorage = getDomainStorage(domainAction)

    if (domainStorage.hasBeenPreloaded) {
      return
    }

    domainStorage.hasBeenPreloaded = true

    await Promise.all(
      Array.from(domainStorage.upstreamSet).map((upstreamDomainStorage) => {
        return preload(upstreamDomainStorage.domainAction)
      }),
    )

    await Promise.all(
      domainStorage.preloadOptionsList.map(async (preloadOptions) => {
        const data = await preloadOptions.query(domainPreloadQueryContext)

        if (Object.prototype.hasOwnProperty.call(domainStorage.preloadedState, preloadOptions.key)) {
          throw new Error(`Duplicate key ${preloadOptions.key}`)
        }

        domainStorage.preloadedState[preloadOptions.key] = data

        const commandOutput = preloadOptions.command(domainPreloadCommandContext, data)
        handleCommandOutput(commandOutput)
      }),
    )
  }

  const getPreloadedState = () => {
    const preloadedState = {} as PreloadedState

    for (const domainStorage of domainStorageMap.values()) {
      Object.assign(preloadedState, domainStorage.preloadedState)
    }

    return preloadedState
  }

  const getDomainPreloadedState = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(
    domainAction: RemeshDomainAction<T, U>,
  ): PreloadedState => {
    const domainStorage = getDomainStorage(domainAction)

    return domainStorage.preloadedState
  }

  const send = (output: RemeshAction) => {
    handleCommandOutput(output)
    commit()
  }

  return {
    name: config.name,
    getDomain,
    igniteDomain,
    discardDomain,
    query: getCurrentQueryValue,
    send,
    discard,
    preload,
    getPreloadedState,
    getDomainPreloadedState,
    subscribeDomain,
    subscribeQuery,
    subscribeEvent,
    getKey: getStorageKey,
  }
}
