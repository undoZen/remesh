var gt=Object.defineProperty,St=Object.defineProperties;var yt=Object.getOwnPropertyDescriptors;var H=Object.getOwnPropertySymbols;var je=Object.prototype.hasOwnProperty,Ue=Object.prototype.propertyIsEnumerable;var Ve=(t,o,r)=>o in t?gt(t,o,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[o]=r,E=(t,o)=>{for(var r in o||(o={}))je.call(o,r)&&Ve(t,r,o[r]);if(H)for(var r of H(o))Ue.call(o,r)&&Ve(t,r,o[r]);return t},D=(t,o)=>St(t,yt(o));var We=(t,o)=>{var r={};for(var s in t)je.call(t,s)&&o.indexOf(s)<0&&(r[s]=t[s]);if(t!=null&&H)for(var s of H(t))o.indexOf(s)<0&&Ue.call(t,s)&&(r[s]=t[s]);return r};import{s as Fe,f as ht,g as vt,h as wt,i as Ke,j as _e,O as te,k as bt,e as Rt,S as Et,l as _,o as $t,r as C,R as Dt,n as Ct}from"./vendor.526a8a9f.js";const Yt=t=>t,A=Symbol("RemeshValuePlaceholder");let Qt=0;function Nt(t){var s;const o=Qt++,r=d=>({type:"RemeshEventPayload",arg:d,Event:r});return r.type="RemeshEvent",r.eventId=o,r.eventName=t.name,r.owner=L(),r.inspectable="inspectable"in t&&(s=t.inspectable)!=null?s:!0,"impl"in t&&(r.impl=t.impl),r}const kt=t=>X({name:t.name,impl:()=>t.default,inspectable:t.inspectable,compare:t.compare}),xt=t=>X({name:t.name,defer:!0,impl:o=>{throw new Error(`RemeshDeferState: use ${t.name} before setting state`)},inspectable:t.inspectable,compare:t.compare});let It=0;const Le=(t,o)=>Ke(t)&&Ke(o)?_e(t,o):Array.isArray(t)&&Array.isArray(o)?_e(t,o):t===o,X=t=>{var d,p,S;const o=It++;let r=null;const s=w=>{if(w===void 0&&r)return r;const b={type:"RemeshStateItem",arg:w,State:s,new:g=>({type:"RemeshStateSetterPayload",stateItem:b,newState:g})};return w===void 0&&(r=b),b};return s.type="RemeshState",s.stateId=o,s.stateName=t.name,s.impl=t.impl,s.compare=(d=t.compare)!=null?d:Le,s.owner=L(),s.inspectable=(p=t.inspectable)!=null?p:!0,s.defer=(S=t.defer)!=null?S:!1,s.query=ne({name:`${t.name}.Query`,inspectable:!1,impl:({get:w},b)=>w(s(b))}),s};let Mt=0;const ne=t=>{var d,p;const o=Mt++;let r=null;const s=S=>{if(S===void 0&&r)return r;const w={type:"RemeshQueryPayload",Query:s,arg:S};return S===void 0&&(r=w),w};return s.type="RemeshQuery",s.queryId=o,s.queryName=t.name,s.prepare=t.prepare,s.impl=t.impl,s.compare=(d=t.compare)!=null?d:Le,s.owner=L(),s.inspectable=(p=t.inspectable)!=null?p:!0,s.scheduler=t.scheduler,s};let At=0;const Te=t=>{var s;const o=At++,r=d=>({type:"RemeshCommandPayload",arg:d,Command:r});return r.type="RemeshCommand",r.commandId=o,r.commandName=t.name,r.impl=t.impl,r.owner=L(),r.inspectable=(s=t.inspectable)!=null?s:!0,r};let Vt=0;const re=t=>{var s;const o=Vt++,r=d=>({type:"RemeshCommand$Payload",arg:d,Command$:r});return r.type="RemeshCommand$",r.command$Id=o,r.command$Name=t.name,r.impl=t.impl,r.owner=L(),r.inspectable=(s=t.inspectable)!=null?s:!0,r},Je=t=>re({name:t.name,inspectable:t.inspectable,impl:(r,s)=>{if(!t.mode||t.mode==="switch")return s.pipe(Fe(d=>t.impl(r,d)));if(t.mode==="merge")return s.pipe(ht(d=>t.impl(r,d)));if(t.mode==="concat")return s.pipe(vt(d=>t.impl(r,d)));if(t.mode==="exhaust")return s.pipe(wt(d=>t.impl(r,d)));throw new Error(`RemeshCommandAsync: invalid mode: ${t.mode}`)}});let jt=0;const Ut=t=>{const o=r=>({type:"RemeshExternPayload",Extern:o,value:r});return o.externId=jt++,o.externName=t.name,o.default=t.default,o};let Wt=0;const oe=t=>{var s;let o=null;const r=d=>{if(d===void 0&&o)return o;const p={type:"RemeshDomainPayload",Domain:r,arg:d};return d===void 0&&(o=p),p};return r.type="RemeshDomain",r.domainId=Wt++,r.domainName=t.name,r.impl=t.impl,r.inspectable=(s=t.inspectable)!=null?s:!0,r},L=oe({name:"DefaultDomain",impl:()=>({})}),N={DomainCreated:"Domain::Created",DomainDestroyed:"Domain::Destroyed",DomainRestored:"Domain::Restored",StateCreated:"State::Created",StateUpdated:"State::Updated",StateDestroyed:"State::Destroyed",StateRestored:"State::Restored",QueryCreated:"Query::Created",QueryUpdated:"Query::Updated",QueryDestroyed:"Query::Destroyed",QueryRestored:"Query::Restored",EventEmitted:"Event::Emitted",CommandReceived:"Command::Received",Command$Received:"Command$::Received"},V=oe({name:"RemeshInspector",impl:t=>{const o=t.event({name:"RemeshDomainStorageEvent"}),r=t.event({name:"RemeshStateStorageEvent"}),s=t.event({name:"RemeshQueryStorageEvent"}),d=t.event({name:"RemeshEventEmitted"}),p=t.event({name:"RemeshCommandReceived"}),S=t.event({name:"RemeshCommand$Received"});return{event:{RemeshDomainStorageEvent:o,RemeshStateStorageEvent:r,RemeshQueryStorageEvent:s,RemeshEventEmittedEvent:d,RemeshCommandReceivedEvent:p,RemeshCommand$ReceivedEvent:S}}}}),U=t=>t.owner?t.owner.Domain.inspectable&&t.inspectable:t.inspectable,Kt=t=>{var o;return((o=t.inspectors)!=null?o:[]).filter(r=>!!r).map(r=>{const p=t,{inspectors:s}=p,d=We(p,["inspectors"]);return r(d)})},_t=t=>{let o=null;const r=()=>(o||(o=Kt(t)),o);return{destroyInspectors:()=>{if(o){for(const a of o)a.destroy();o=null}},inspectDomainStorage:(a,m)=>{if(U(m.Domain))for(const f of r()){const k=f.getDomain(V()).event.RemeshDomainStorageEvent({type:a,storage:m});f.emitEvent(k)}},inspectStateStorage:(a,m)=>{if(U(m.State))for(const f of r()){const k=f.getDomain(V()).event.RemeshStateStorageEvent({type:a,storage:m});f.emitEvent(k)}},inspectQueryStorage:(a,m)=>{if(U(m.Query))for(const f of r()){const k=f.getDomain(V()).event.RemeshQueryStorageEvent({type:a,storage:m});f.emitEvent(k)}},inspectEventEmitted:(a,m)=>{if(U(m.Event))for(const f of r()){const k=f.getDomain(V()).event.RemeshEventEmittedEvent({type:a,payload:m});f.emitEvent(k)}},inspectCommandReceived:(a,m)=>{if(U(m.Command))for(const f of r()){const k=f.getDomain(V()).event.RemeshCommandReceivedEvent({type:a,payload:m});f.emitEvent(k)}},inspectCommand$Received:(a,m)=>{if(U(m.Command$))for(const f of r()){const k=f.getDomain(V()).event.RemeshCommand$ReceivedEvent({type:a,payload:m});f.emitEvent(k)}}}},ee=new WeakMap,zt=t=>{if(ee.has(t))return ee.get(t);let o=null;const r=new te(s=>{if(o){s.next(o),s.complete();return}const d=F(t);if(d.type!=="pending"){o=d,s.next(d),s.complete();return}s.next({type:"pending"}),t.then(p=>{const S={type:"resolved",value:p};o=S,s.next(S),s.complete()},p=>{const S={type:"rejected",error:p};o=S,s.next(S),s.complete()})});return ee.set(t,r),r},W=new WeakMap,F=function(t){return W.has(t)||(W.set(t,{type:"pending"}),t.then(o=>{W.set(t,{type:"resolved",value:o})},o=>{o instanceof Error?W.set(t,{type:"rejected",error:o}):W.set(t,{type:"rejected",error:new Error(o)})})),W.get(t)};let z=0;const He=t=>{const o=E({},t),r=_t(o),s=new Set,d=new Map,p=new Set,S=new WeakMap,w=e=>{var n;for(const c of(n=o.externs)!=null?n:[])if(c.Extern===e)return c.value;return e.default},b=e=>{const n=S.get(e);if(n)return n;const c=w(e),u={id:z++,type:"RemeshExternStorage",Extern:e,currentValue:c};return S.set(e,u),u},g=e=>b(e).currentValue,a=new WeakMap,m=e=>{var l;const n=a.get(e);if(n)return n;const c=e.State.stateName,u=(l=JSON.stringify(e.arg))!=null?l:"",i=`State/${e.State.stateId}/${c}:${u}`;return a.set(e,i),i},f=e=>{var l;const n=a.get(e);if(n)return n;const c=e.Query.queryName,u=(l=JSON.stringify(e.arg))!=null?l:"",i=`Query/${e.Query.queryId}/${c}:${u}`;return a.set(e,i),i},M=e=>{var l;const n=a.get(e);if(n)return n;const c=e.Domain.domainName,u=(l=JSON.stringify(e.arg))!=null?l:"",i=`Domain/${e.Domain.domainId}/${c}:${u}`;return a.set(e,i),i},k=e=>e.type==="RemeshStateItem"?m(e):e.type==="RemeshQueryPayload"?f(e):M(e),Ze=e=>{if(e.currentState===A)throw new Error(`${e.key} is not found`);return e.currentState},se=new WeakMap,ae=(e,n)=>e.defer?A:e.impl(n),Oe=e=>{const n=$(e.State.owner),c=m(e),u=ae(e.State,e.arg),i={id:z++,type:"RemeshStateStorage",State:e.State,arg:e.arg,key:c,currentState:u,downstreamSet:new Set};return n.stateMap.set(c,i),se.set(e,i),r.inspectStateStorage(N.StateCreated,i),i},ce=e=>{const n=$(e.State.owner);n.stateMap.has(e.key)||(e.currentState=ae(e.State,e.arg),n.stateMap.set(e.key,e),r.inspectStateStorage(N.StateRestored,e))},K=e=>{const n=$(e.State.owner),c=m(e),u=n.stateMap.get(c);if(u)return u;const i=se.get(e);return i?(ce(i),i):Oe(e)},me=new WeakMap,qe=e=>{const n=$(e.owner),c=new _,u=new te(R=>{const v=c.subscribe(R);return l.refCount+=1,()=>{v.unsubscribe(),l.refCount-=1,p.add(l),T()}}),i=me.get(e),l=Object.assign(i!=null?i:{},{type:"RemeshEventStorage",Event:e,subject:c,observable:u,refCount:0});return n.eventMap.set(e,l),me.set(e,l),l},Y=e=>{const c=$(e.owner).eventMap.get(e);return c||qe(e)},ue=new WeakMap,ie=e=>{const n=new _,c=new te(u=>{const i=n.subscribe(u),l=e();return l.refCount+=1,()=>{i.unsubscribe(),l.refCount-=1,p.add(l),T()}});return{subject:n,observable:c}},de=(e,n,c)=>{if(!e.prepare)return;const u=e.prepare(n,c);if(!!u){if(Array.isArray(u)){for(const i of u)q(i);return}q(u)}},pe=e=>{if(!e.Query.scheduler)return;const n=new _;e.schedulerSubject=n;const c={get:y.get,get unwrap(){return y.unwrap.bind(c)},peek:y.peek,hasNoValue:y.hasNoValue,fromEvent:y.fromEvent,fromQuery:y.fromQuery};e.Query.scheduler(c,n.asObservable()).subscribe(()=>{Ce(e),O()})},Pe=e=>{const n=$(e.Query.owner),c=f(e),{subject:u,observable:i}=ie(()=>R),l=new Set,R={id:z++,type:"RemeshQueryStorage",Query:e.Query,arg:e.arg,currentValue:A,key:c,upstreamSet:l,downstreamSet:new Set,subject:u,observable:i,refCount:0},{Query:v}=e;pe(R);const h={get:x=>{if(R.upstreamSet!==l)return y.get(x);if(x.type==="RemeshStateItem"){const I=K(x);return R.upstreamSet.add(I),I.downstreamSet.add(R),y.get(x)}if(x.type==="RemeshQueryPayload"){const I=j(x);return R.upstreamSet.add(I),I.downstreamSet.add(R),y.get(x)}return y.get(x)},get unwrap(){return y.unwrap.bind(h)},peek:y.peek,hasNoValue:y.hasNoValue};de(v,h,e.arg);const Q=v.impl(h,e.arg);return Q instanceof Promise&&F(Q),R.currentValue=Q,n.queryMap.set(c,R),ue.set(e,R),r.inspectQueryStorage(N.QueryCreated,R),R},le=e=>{const n=$(e.Query.owner);if(n.queryMap.has(e.key))return;const{subject:c,observable:u}=ie(()=>e);e.subject=c,e.observable=u,n.queryMap.set(e.key,e),pe(e);for(const i of e.upstreamSet)if(i.downstreamSet.add(e),i.type==="RemeshQueryStorage")le(i);else if(i.type==="RemeshStateStorage")ce(i);else throw new Error(`Unknown upstream: ${i}`);Z(e),r.inspectQueryStorage(N.QueryRestored,e)},j=e=>{const n=$(e.Query.owner),c=f(e),u=n.queryMap.get(c);if(u)return u;const i=ue.get(e);return i?(le(i),i):Pe(e)},fe=new WeakMap,et=e=>{const n=$(e.owner),c=new _,u=c.asObservable(),i={id:z++,type:"RemeshCommand$Storage",Command$:e,subject:c,observable:u};return n.command$Map.set(e,i),fe.set(e,i),i},ge=e=>{const n=$(e.owner),c=n.command$Map.get(e);if(c)return c;const u=fe.get(e);if(u){const i=new _,l=i.asObservable();return u.subject=i,u.observable=l,u.subscription=void 0,n.command$Map.set(e,u),u}return et(e)},Se=new WeakMap,tt=e=>{const n=M(e),c=new Set,u=new Set,i={state:v=>{if("default"in v){const Q=kt(v);return Q.owner=e,Q.query.owner=e,Q}if(!("impl"in v)){const Q=xt(v);return Q.owner=e,Q.query.owner=e,Q}const h=X(v);return h.owner=e,h.query.owner=e,h},query:v=>{const h=ne(v);return h.owner=e,h},event:v=>{const h=Nt(v);return h.owner=e,h},command:v=>{const h=Te(v);return h.owner=e,h},command$:v=>{const h=re(v);return h.owner=e,u.add(h),l.running&&J(h),h},ignite:v=>{i.command$({name:"ignite",inspectable:!1,impl:h=>$t(v(h))})},commandAsync:v=>{const h=Je(v);return h.owner=e,u.add(h),l.running&&J(h),h},getDomain:v=>{const h=$(v);return c.add(h),h.domain},getExtern:v=>g(v)},l={id:z++,type:"RemeshDomainStorage",Domain:e.Domain,arg:e.arg,get domain(){return R},domainContext:i,domainPayload:e,key:n,command$Set:u,upstreamSet:c,downstreamSet:new Set,upstreamSubscriptionSet:new Set,domainSubscriptionSet:new Set,stateMap:new Map,queryMap:new Map,eventMap:new Map,command$Map:new Map,refCount:0,running:!1},R=e.Domain.impl(i,e.arg);d.set(n,l),Se.set(e,l),r.inspectDomainStorage(N.DomainCreated,l);for(const v of c)v.downstreamSet.add(l);return l},$=e=>{const n=M(e),c=d.get(n);if(c)return c;const u=Se.get(e);if(u){u.running=!1,d.set(u.key,u);for(const i of u.upstreamSet)i.downstreamSet.add(u);return r.inspectDomainStorage(N.DomainRestored,u),u}return tt(e)},ye=e=>{var c;const n=$(e.Query.owner);if(!!n.queryMap.has(e.key)){n.queryMap.delete(e.key),r.inspectQueryStorage(N.QueryDestroyed,e);for(const u of e.upstreamSet)if(u.downstreamSet.delete(e),u.type==="RemeshQueryStorage")he(u);else if(u.type==="RemeshStateStorage")we(u);else throw new Error(`Unknown upstream in clearQueryStorageIfNeeded(..): ${u}`);(c=e.schedulerSubject)==null||c.complete(),e.subject.complete()}},he=e=>{e.refCount===0&&e.downstreamSet.size===0&&ye(e)},ve=e=>{const n=$(e.State.owner);!n.stateMap.has(e.key)||(r.inspectStateStorage(N.StateDestroyed,e),n.stateMap.delete(e.key),e.downstreamSet.clear())},we=e=>{e.downstreamSet.size===0&&ve(e)},be=e=>{const n=$(e.Event.owner);e.subject.complete(),n.eventMap.delete(e.Event)},nt=e=>{e.refCount===0&&be(e)},rt=e=>{var c;const n=$(e.Command$.owner);e.subject.complete(),(c=e.subscription)==null||c.unsubscribe(),e.subscription=void 0,n.command$Map.delete(e.Command$)},Re=e=>{r.inspectDomainStorage(N.DomainDestroyed,e),ze(e.domainSubscriptionSet),ze(e.upstreamSubscriptionSet);for(const n of e.eventMap.values())be(n);for(const n of e.queryMap.values())ye(n);for(const n of e.stateMap.values())ve(n);for(const n of e.command$Map.values())rt(n);e.upstreamSubscriptionSet.clear(),e.domainSubscriptionSet.clear(),e.downstreamSet.clear(),e.stateMap.clear(),e.queryMap.clear(),e.eventMap.clear(),e.running=!1,d.delete(e.key);for(const n of e.upstreamSet)n.downstreamSet.delete(e),Ee(n)},Ee=e=>{e.refCount===0&&e.downstreamSet.size===0&&e.domainSubscriptionSet.size===0&&Re(e)},ot=e=>{const n=K(e);return Ze(n)},$e=e=>{const n=j(e),c=n.currentValue;if(c===A)throw new Error(`Query ${n.key} is not ready yet.`);return c},G=new WeakMap,De=e=>{const n=j(e);if(G.has(n))return G.get(n);const u=$(e.Query.owner).domainContext,i=y.get(e),l=F(i),R=u.state({name:`${e.Query.queryName}.UnwrappedState`,inspectable:!1,default:l}),v=u.query({name:`${e.Query.queryName}.UnwrappedQuery`,inspectable:!1,impl:({get:x})=>x(R())}),h=u.command({name:`${e.Query.queryName}.updateUnwrappedState`,inspectable:!1,impl:(x,I)=>R().new(I)});u.command$({name:`${e.Query.queryName}.UnwrappedCommand$`,inspectable:!1,impl:({fromQuery:x,get:I})=>x(e).pipe(bt(I(e)),Fe(zt),Rt(h))});const Q=v();return G.set(n,Q),Q},y={get:e=>{if(e.type==="RemeshStateItem")return ot(e);if(e.type==="RemeshQueryPayload")return $e(e);throw new Error(`Unexpected input in ctx.get(..): ${e}`)},unwrap(e){const n=De(e);return this.get(n)},peek:e=>{if(e.type==="RemeshStateItem")return K(e).currentState;if(e.type==="RemeshQueryPayload")return j(e).currentValue;throw new Error(`Unexpected input in peek(..): ${e}`)},hasNoValue:e=>y.peek(e)===A,fromEvent:e=>Y(e).observable,fromQuery:e=>j(e).observable},Z=e=>{if(e.schedulerSubject)if(e.currentValue!==A)e.schedulerSubject.next(e.currentValue);else throw new Error(`Query ${e.key} is not ready yet.`);else Ce(e)},Ce=e=>{const{Query:n}=e;for(const l of e.upstreamSet)l.downstreamSet.delete(e),l.downstreamSet.size===0&&p.add(l);const c=new Set;e.upstreamSet=c;const u={get:l=>{if(e.upstreamSet!==c)return y.get(l);if(l.type==="RemeshStateItem"){const R=K(l);return e.upstreamSet.add(R),R.downstreamSet.add(e),y.get(l)}if(l.type==="RemeshQueryPayload"){const R=j(l);return e.upstreamSet.add(R),R.downstreamSet.add(e),y.get(l)}return y.get(l)},get unwrap(){return y.unwrap.bind(u)},peek:y.peek,hasNoValue:y.hasNoValue};de(n,u,e.arg);const i=n.impl(u,e.arg);if(!(e.currentValue!==A&&n.compare(e.currentValue,i))){e.currentValue=i,i instanceof Promise&&F(i),s.add(e),r.inspectQueryStorage(N.QueryUpdated,e);for(const l of[...e.downstreamSet])Z(l)}},T=()=>{if(p.size===0)return;const e=[...p];p.clear();for(const n of e)n.type==="RemeshDomainStorage"?Ee(n):n.type==="RemeshEventStorage"?nt(n):n.type==="RemeshQueryStorage"?he(n):n.type==="RemeshStateStorage"&&we(n);T()},Qe=()=>{if(s.size===0)return;const e=[...s];s.clear();for(const n of e)s.has(n)||n.subject.next(n.currentValue);Qe()},O=()=>{Qe()},q=e=>{const n=K(e.stateItem);if(!(n.currentState!==A&&e.stateItem.State.compare(n.currentState,e.newState))){n.currentState=e.newState,r.inspectStateStorage(N.StateUpdated,n);for(const c of[...n.downstreamSet])Z(c)}},Ne=e=>{const{Event:n,arg:c}=e,u=Y(n);if(r.inspectEventEmitted(N.EventEmitted,e),n.impl){const i={get:y.get,get unwrap(){return y.unwrap.bind(i)},peek:y.peek,hasNoValue:y.hasNoValue},l=n.impl(i,c);u.subject.next(l)}else u.subject.next(c)},ke=e=>{r.inspectCommandReceived(N.CommandReceived,e);const{Command:n,arg:c}=e,u={get:y.get,get unwrap(){return y.unwrap.bind(u)},peek:y.peek,hasNoValue:y.hasNoValue},i=n.impl(u,c);P(i)},xe=(e,n)=>{e.add(n),n.add(()=>{e.delete(n)})},J=e=>{const n=ge(e);if(n.subscription)return;const c={get:y.get,get unwrap(){return y.unwrap.bind(c)},peek:y.peek,hasNoValue:y.hasNoValue,fromEvent:y.fromEvent,fromQuery:y.fromQuery},i=e.impl(c,n.observable).subscribe(l=>{P(l),O()});n.subscription=i},P=e=>{if(!!e){if(Array.isArray(e)){for(const n of e)P(n);return}if(e.type==="RemeshCommandPayload"){ke(e);return}else if(e.type==="RemeshEventPayload"){Ne(e);return}else if(e.type==="RemeshStateSetterPayload"){q(e);return}else if(e.type==="RemeshCommand$Payload"){Ie(e);return}throw new Error(`Unknown command output of ${e}`)}},Ie=e=>{r.inspectCommand$Received(N.Command$Received,e);const{Command$:n,arg:c}=e,u=ge(n);J(n),u.subject.next(c)},st=(e,n)=>{xe(e.domainSubscriptionSet,n),n.add(()=>{p.add(e),T()})},at=(e,n)=>{const c=j(e);return c.observable.subscribe(n)},ct=(e,n)=>Y(e).observable.subscribe(n),mt=e=>{const n={};for(const c in e.command){const u=e.command[c];n[c]=i=>Ae(u(i))}return n},ut=e=>{const n=$(e);if(n.domainOutput)return n.domainOutput;const c=n.domain,u=mt(c),i=D(E({},c),{command:u});return n.domainOutput=i,i},it=e=>{for(const n of e)J(n)},dt=e=>{if(!e.running){e.running=!0;for(const n of e.upstreamSet){const c=Me(n.domainPayload);xe(e.upstreamSubscriptionSet,c)}it(e.command$Set)}},Me=e=>{const n=$(e),c=new Et;return st(n,c),dt(n),c},pt=()=>{r.destroyInspectors();for(const e of d.values())Re(e);d.clear(),s.clear()},lt=e=>{Ne(e)},Ae=e=>{e.type==="RemeshCommandPayload"?(ke(e),O()):e.type==="RemeshCommand$Payload"&&Ie(e)},ft=e=>y.unwrap(e);return{name:o.name,getDomain:ut,query:$e,unwrap:ft,getUnwrappedQueryPayload:De,emitEvent:lt,sendCommand:Ae,destroy:pt,subscribeQuery:at,subscribeEvent:ct,subscribeDomain:Me,getKey:k}},ze=t=>{for(const o of t)o.unsubscribe()},Xe={domain:oe,extern:Ut,store:He,state:X,query:ne,command:Te,command$:re,commandAsync:Je},Be=C.exports.createContext(null),Ft=()=>{const t=C.exports.useContext(Be);if(t===null)throw new Error("You may forgot to add <RemeshRoot />");return t},B=()=>Ft().remeshStore,Gt=t=>{const o=C.exports.useRef(t.store);o.current||(o.current=He("options"in t?t.options:{}));const r=o.current,s=C.exports.useMemo(()=>({remeshStore:r}),[r]);return Dt.createElement(Be.Provider,{value:s},t.children)},Ye=function(t){Lt(t.Query.owner);const o=B(),r=C.exports.useRef(null),s=C.exports.useCallback(b=>(r.current=b,()=>{r.current=null}),[]),d=C.exports.useCallback(()=>o.query(t),[o,t]),p=Ct.exports.useSyncExternalStore(s,d),S=C.exports.useRef(null),w=o.getKey(t);return C.exports.useEffect(()=>()=>{var b;(b=S.current)==null||b.unsubscribe(),S.current=null},[o,w]),C.exports.useEffect(()=>{S.current===null&&(S.current=o.subscribeQuery(t,()=>{var b;(b=r.current)==null||b.call(r)}))},[o,t]),p},Zt=function(t){const r=B().getUnwrappedQueryPayload(t);return Ye(r)},Ot=function(t){const o=Ye(t),r=F(o);if(r.type==="pending")throw o;if(r.type==="rejected")throw r.error;return r.value},qt=function(t,o){const r=B(),s=C.exports.useRef(o);C.exports.useEffect(()=>{s.current=o}),C.exports.useEffect(()=>{const d=r.subscribeEvent(t,p=>{s.current(p)});return()=>{d.unsubscribe()}},[t,r])},Lt=function(t){const o=B(),r=C.exports.useRef(null),s=o.getDomain(t),d=o.getKey(t);return C.exports.useEffect(()=>()=>{var p;(p=r.current)==null||p.unsubscribe(),r.current=null},[o,d]),C.exports.useEffect(()=>{r.current===null&&(r.current=o.subscribeDomain(t))},[o,t]),s},Tt=t=>{const o=t.getHours().toString().padStart(2,"0"),r=t.getMinutes().toString().padStart(2,"0"),s=t.getSeconds().toString().padStart(2,"0"),d=t.getMilliseconds().toString().padStart(3,"0");return`${o}:${r}:${s}.${d}`},Jt=()=>{const t=new Date;return Tt(t)},Ge=t=>{const o=E({include:["state","domain","event","command","command$"]},t);return{onActive:(s,d)=>{var p;(p=o.exclude)!=null&&p.includes(s)||(o.include?o.include.includes(s)&&d():d())}}},Ht=()=>{if(typeof window!="undefined")return window.__REDUX_DEVTOOLS_EXTENSION__},Pt=t=>{const o=Ht();if(!!o)return r=>{var g;const s=Ge(t),d=o.connect({name:r==null?void 0:r.name,features:{pause:!1,lock:!1,persist:!1,export:!1,import:!1,jump:!1,skip:!1,reorder:!1,dispatch:!1,test:!1}}),p=(a,m)=>{d.send(m,null)},S=Xe.store({name:`RemeshReduxDevtools(${(g=r==null?void 0:r.name)!=null?g:""})`}),w=S.getDomain(V()),b=a=>{const m={domainId:a.Domain.domainId,domainName:a.Domain.domainName};return a.arg!==void 0?D(E({},m),{domainArg:a.arg}):m};return s.onActive("domain",()=>{S.subscribeEvent(w.event.RemeshDomainStorageEvent,a=>{const m=a.storage.Domain,f={type:`${a.type}::${m.domainName}`,domainId:m.domainId,domainName:m.domainName};a.storage.arg!==void 0?p(f.type,D(E({},f),{domainArg:a.storage.arg})):p(f.type,f)})}),s.onActive("state",()=>{S.subscribeEvent(w.event.RemeshStateStorageEvent,a=>{const m=a.storage.State,f={type:`${a.type}::${m.stateName}`,owner:b(m.owner),stateId:m.stateId,stateName:m.stateName,stateValue:a.storage.currentState};a.storage.arg!==void 0?p(f.type,D(E({},f),{stateArg:a.storage.arg})):p(f.type,f)})}),s.onActive("query",()=>{S.subscribeEvent(w.event.RemeshQueryStorageEvent,a=>{const m=a.storage.Query,f={type:`${a.type}::${m.queryName}`,owner:b(m.owner),queryId:m.queryId,queryName:m.queryName};a.storage.arg!==void 0?p(f.type,D(E({},f),{queryArg:a.storage.arg})):p(f.type,f)})}),s.onActive("command",()=>{S.subscribeEvent(w.event.RemeshCommandReceivedEvent,a=>{const m=a.payload.Command,f={type:`${a.type}::${m.commandName}`,owner:b(m.owner),commandId:m.commandId,commandName:m.commandName};a.payload.arg!==void 0?p(f.type,D(E({},f),{commandArg:a.payload.arg})):p(f.type,f)})}),s.onActive("command$",()=>{S.subscribeEvent(w.event.RemeshCommand$ReceivedEvent,a=>{const m=a.payload.Command$,f={type:`${a.type}::${m.command$Name}`,owner:b(m.owner),command$Id:m.command$Id,command$Name:m.command$Name};a.payload.arg!==void 0?p(f.type,D(E({},f),{command$Arg:a.payload.arg})):p(f.type,f)})}),s.onActive("event",()=>{S.subscribeEvent(w.event.RemeshEventEmittedEvent,a=>{const m=a.payload.Event,f={type:`${a.type}::${m.eventName}`,owner:b(m.owner),eventId:m.eventId,eventName:m.eventName};a.payload.arg!==void 0?p(f.type,D(E({},f),{eventArg:a.payload.arg})):p(f.type,f)})}),S}},en=t=>o=>{var b;const r=E({collapsed:!0},t),s=Ge(r),d=(g,a)=>{if(r.collapsed){const m=g.split("::");console.groupCollapsed(`%c${m[0]}%c::%c${m[1]}%c::%c${m[2]}%c @ ${Jt()}`,"color:#03A9F4; font-weight: bold","color:#9E9E9E; font-weight: bold","color:#4CAF50; font-weight: bold","color:#9E9E9E; font-weight: bold","color:#AA07DE; font-weight: bold","color:#9E9E9E; font-weight: lighter")}console.log(a),r.collapsed&&console.groupEnd()},p=Xe.store(D(E({},o),{name:`RemeshLogger(${(b=o==null?void 0:o.name)!=null?b:""})`})),S=p.getDomain(V()),w=g=>{const a={domainId:g.Domain.domainId,domainName:g.Domain.domainName};return g.arg!==void 0?D(E({},a),{domainArg:g.arg}):a};return s.onActive("domain",()=>{p.subscribeEvent(S.event.RemeshDomainStorageEvent,g=>{const a=g.storage.Domain,m={type:`${g.type}::${a.domainName}`,domainId:a.domainId,domainName:a.domainName};g.storage.arg!==void 0?d(m.type,D(E({},m),{domainArg:g.storage.arg})):d(m.type,m)})}),s.onActive("state",()=>{p.subscribeEvent(S.event.RemeshStateStorageEvent,g=>{const a=g.storage.State,m={type:`${g.type}::${a.stateName}`,owner:w(a.owner),stateId:a.stateId,stateName:a.stateName,stateValue:g.storage.currentState};g.storage.arg!==void 0?d(m.type,D(E({},m),{stateArg:g.storage.arg})):d(m.type,m)})}),s.onActive("query",()=>{p.subscribeEvent(S.event.RemeshQueryStorageEvent,g=>{const a=g.storage.Query,m={type:`${g.type}::${a.queryName}`,owner:w(a.owner),queryId:a.queryId,queryName:a.queryName,queryValue:g.storage.currentValue};g.storage.arg!==void 0?d(m.type,D(E({},m),{queryArg:g.storage.arg})):d(m.type,m)})}),s.onActive("command",()=>{p.subscribeEvent(S.event.RemeshCommandReceivedEvent,g=>{const a=g.payload.Command,m={type:`${g.type}::${a.commandName}`,owner:w(a.owner),commandId:a.commandId,commandName:a.commandName};g.payload.arg!==void 0?d(m.type,D(E({},m),{commandArg:g.payload.arg})):d(m.type,m)})}),s.onActive("command$",()=>{p.subscribeEvent(S.event.RemeshCommand$ReceivedEvent,g=>{const a=g.payload.Command$,m={type:`${g.type}::${a.command$Name}`,owner:w(a.owner),command$Id:a.command$Id,command$Name:a.command$Name};g.payload.arg!==void 0?d(m.type,D(E({},m),{command$Arg:g.payload.arg})):d(m.type,m)})}),s.onActive("event",()=>{p.subscribeEvent(S.event.RemeshEventEmittedEvent,g=>{const a=g.payload.Event,m={type:`${g.type}::${a.eventName}`,owner:w(a.owner),eventId:a.eventId,eventName:a.eventName};g.payload.arg!==void 0?d(m.type,D(E({},m),{eventArg:g.payload.arg})):d(m.type,m)})}),p};export{Xe as R,Ye as a,Pt as b,en as c,Gt as d,Yt as e,qt as f,Zt as g,Ot as h,Lt as u};
//# sourceMappingURL=remesh-logger.0aa7cbad.js.map
