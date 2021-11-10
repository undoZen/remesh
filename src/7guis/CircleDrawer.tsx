import React, { ComponentPropsWithoutRef, useEffect } from 'react';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Remesh } from '../remesh';
import {
  useRemeshDomain,
  useRemeshEmit,
  useRemeshQuery,
} from '../remesh/react';

type Position = { x: number; y: number };

type DrawAction = {
  position: Position;
  diameter: number;
};

type AdjustAction = {
  index: number;
  diameter: number;
};

type Circle = {
  position: Position;
  diameter: number;
};

type DrawState = {
  circles: Circle[];
};

type TooltipsState =
  | {
      type: 'default';
    }
  | {
      type: 'show-tips';
      index: number;
    }
  | {
      type: 'open-slider';
      index: number;
      circle: Circle;
    };

const CircleDrawer = Remesh.domain({
  name: 'CircleDrawer',
  impl: (domain) => {
    const HistoryState = domain.state<DrawState[]>({
      name: 'HistoryState',
      default: [],
    });

    const HistoryQuery = domain.query({
      name: 'HistoryQuery',
      impl: ({ get }) => {
        const history = get(HistoryState());
        return history;
      },
    });

    const HistoryIndexState = domain.state<number>({
      name: 'HistoryIndexState',
      default: 0,
    });

    const addAction = domain.command({
      name: 'addAction',
      impl: ({ get }, state: DrawState) => {
        const history = get(HistoryState());
        const newHistory = [...history, state];
        return [
          HistoryState().new(newHistory),
          HistoryIndexState().new(history.length),
        ];
      },
    });

    const DrawState = domain.state<DrawState>({
      name: 'DrawState',
      default: {
        circles: [],
      },
    });

    const DrawQuery = domain.query({
      name: 'DrawQuery',
      impl: ({ get }) => {
        const state = get(DrawState());
        return state;
      },
    });

    const replaceDrawState = domain.command({
      name: 'replaceDrawState',
      impl: ({ get }, state: DrawState) => {
        return DrawState().new(state);
      },
    });

    const undo = domain.command({
      name: 'undo',
      impl: ({ get }) => {
        const history = get(HistoryState());
        const index = get(HistoryIndexState());

        if (index === 0) {
          return [];
        }

        const newIndex = index - 1;

        return [
          replaceDrawState(history[newIndex]),
          HistoryIndexState().new(newIndex),
        ];
      },
    });

    const redo = domain.command({
      name: 'redo',
      impl: ({ get }) => {
        const history = get(HistoryState());
        const index = get(HistoryIndexState());

        if (index === history.length - 1) {
          return [];
        }

        const newIndex = index + 1;

        return [
          replaceDrawState(history[newIndex]),
          HistoryIndexState().new(newIndex),
        ];
      },
    });

    const SelectedIndexState = domain.state<number>({
      name: 'SelectedIndexState',
      default: -1,
    });

    const SelectedIndexQuery = domain.query({
      name: 'SelectedIndexQuery',
      impl: ({ get }) => {
        const index = get(SelectedIndexState());
        return index;
      },
    });

    const setSelectedIndex = domain.command({
      name: 'setSelectedIndex',
      impl: ({}, index: number) => {
        return SelectedIndexState().new(index);
      },
    });

    const draw = domain.command({
      name: 'draw',
      impl: ({ get }, action: DrawAction) => {
        const state = get(DrawState());
        const newState = {
          circles: [
            ...state.circles,
            { position: action.position, diameter: action.diameter },
          ],
        };
        return [DrawState().new(newState), addAction(newState)];
      },
    });

    const adjust = domain.command({
      name: 'adjust',
      impl: ({ get }, action: AdjustAction) => {
        const state = get(DrawState());
        const circles = state.circles.map((circle, index) => {
          if (index === action.index) {
            return {
              position: circle.position,
              diameter: action.diameter,
            };
          }
          return circle;
        });

        const newState = {
          circles,
        };

        return [DrawState().new(newState), addAction(newState)];
      },
    });

    const TooltipsState = domain.state<TooltipsState>({
      name: 'TooltipsState',
      default: {
        type: 'default',
      },
    });

    const TooltipsQuery = domain.query({
      name: 'TooltipsQuery',
      impl: ({ get }) => {
        const state = get(TooltipsState());
        return state;
      },
    });

    const updateTooltips = domain.command({
      name: 'updateTooltips',
      impl: ({}, newState: TooltipsState) => {
        return TooltipsState().new(newState);
      },
    });

    const mainTask = domain.task({
      name: 'mainTask',
      impl: ({ fromEvent }) => {
        const draw$ = fromEvent(draw.Event).pipe(map((action) => draw(action)));

        const adjust$ = fromEvent(adjust.Event).pipe(
          map((action) => adjust(action))
        );
        const updateTooltips$ = fromEvent(updateTooltips.Event).pipe(
          map((tooltipsState) => updateTooltips(tooltipsState))
        );

        const undo$ = fromEvent(undo.Event).pipe(map(() => undo()));
        const redo$ = fromEvent(redo.Event).pipe(map(() => redo()));

        const setSelectedIndex$ = fromEvent(setSelectedIndex.Event).pipe(
          map((index) => setSelectedIndex(index))
        );

        return merge(
          draw$,
          adjust$,
          undo$,
          redo$,
          setSelectedIndex$,
          updateTooltips$
        );
      },
    });

    return {
      autorun: [mainTask],
      query: {
        HistoryQuery,
        DrawQuery,
        TooltipsQuery,
        SelectedIndexQuery,
      },
      event: {
        draw: draw.Event,
        adjust: adjust.Event,
        updateTooltips: updateTooltips.Event,
        undo: undo.Event,
        redo: redo.Event,
        setSelectedIndex: setSelectedIndex.Event,
      },
    };
  },
});

const positionInCircle = (position: Position, circle: Circle): boolean => {
  const { x, y } = position;
  const { diameter, position: circlePosition } = circle;
  const { x: circleX, y: circleY } = circlePosition;
  const radius = diameter / 2;
  const dx = x - circleX;
  const dy = y - circleY;

  return dx * dx + dy * dy < radius * radius;
};

export const CircleDrawerApp = () => {
  const domain = useRemeshDomain(CircleDrawer);
  const drawState = useRemeshQuery(domain.query.DrawQuery());
  const tooltipsState = useRemeshQuery(domain.query.TooltipsQuery());

  const emit = useRemeshEmit();

  const getCircleInfo = (position: Position) => {
    const circle = drawState.circles.find((circle) => {
      return positionInCircle(position, circle);
    });

    if (!circle) {
      return null;
    }

    const index = drawState.circles.indexOf(circle);

    return {
      index,
      circle,
    };
  };

  const handleRightClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const position = { x: clientX, y: clientY };

    const circleInfo = getCircleInfo(position);

    if (circleInfo) {
      emit(
        domain.event.updateTooltips({
          type: 'show-tips',
          index: circleInfo.index,
        })
      );
    }
  };

  const handleLeftClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY } = e;
    const position = { x: clientX, y: clientY };
    const circleInfo = getCircleInfo(position);

    if (circleInfo) {
      emit(domain.event.setSelectedIndex(circleInfo.index));
    } else {
      emit(domain.event.draw({ position, diameter: 15 }));
    }
  };

  const handleOpenSlider = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { clientX, clientY } = e;
    const position = { x: clientX, y: clientY };
    const circleInfo = getCircleInfo(position);

    if (circleInfo) {
      emit(
        domain.event.updateTooltips({
          type: 'open-slider',
          index: circleInfo.index,
          circle: circleInfo.circle,
        })
      );
    }
  };

  const handleCloseSlider = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { clientX, clientY } = e;
    const position = { x: clientX, y: clientY };
    const circleInfo = getCircleInfo(position);

    if (circleInfo) {
      emit(
        domain.event.updateTooltips({
          type: 'default',
        })
      );
    }
  };
};
