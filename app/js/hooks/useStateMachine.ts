/**
 * @module useStateMachine
 * @see https://github.com/cassiozen/useStateMachine
 */

import { isString } from '/js/utils/utils';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

const enum ActionType {
  Update,
  Transition
}

interface Updater<C> {
  (context: C): C;
}

interface UpdateAction<C> {
  updater: Updater<C>;
  type: ActionType.Update;
}

interface Update<C> {
  (updater: Updater<C>): void;
}

interface Send<E extends string> {
  (event: E): void;
}

interface TransitionAction<E extends string> {
  event: E;
  type: ActionType.Transition;
}

interface State<C, S extends string, E extends string> {
  readonly value: S;
  readonly event?: E;
  readonly context: C;
  readonly nextEvents: E[];
}

interface Options<C, S extends string, E extends string> {
  initial: S;
  verbose?: boolean;
  states: {
    [key in S]: StateOptions<C, S, E>;
  };
}

interface Reducer<C, S extends string, E extends string> {
  (state: State<C, S, E>, action: Action<C, E>): State<C, S, E>;
}

interface StateOptions<C, S extends string, E extends string> {
  on?: {
    [key in E]?: Transition<C, S>;
  };
  effect?: (send: Send<E>, update: Update<C>) => void | (() => void);
}

type Action<C, E extends string> = UpdateAction<C> | TransitionAction<E>;

type Transition<C, S extends string> = S | { target: S; guard?: (context: C) => boolean };

type UseStateMachine<C, S extends string, E extends string> = [state: State<C, S, E>, send: Send<E>, update: Update<C>];

function getState<C, S extends string, E extends string>(
  value: S,
  context: C,
  options: Options<C, S, E>,
  event?: E
): State<C, S, E> {
  const { on } = options.states[value];
  const nextEvents = (on ? Object.keys(on) : []) as E[];

  return { value, event, context, nextEvents };
}

function debug(message: string, ...data: any[]): void {
  console.debug(`%cuseStateMachine %c${message}`, 'color: #888;', 'color: default;', ...data);
}

function getReducer<C, S extends string, E extends string>(options: Options<C, S, E>): Reducer<C, S, E> {
  return function reducer(state: State<C, S, E>, action: Action<C, E>): State<C, S, E> {
    const { value, context } = state;

    switch (action.type) {
      case ActionType.Update:
        // Internal action to update context.
        const nextContext = action.updater(context);

        if (options.verbose) {
          debug('Context update from %o to %o', context, nextContext);
        }

        return { value, context: nextContext, nextEvents: state.nextEvents };
      case ActionType.Transition:
        const { event } = action;
        const current = options.states[value];
        const nextState: Transition<C, S> | undefined = current?.on?.[event];

        // If there is no defined next state, return early.
        if (!nextState) {
          if (options.verbose) {
            debug(`Current state %o doesn't listen to event "${event}".`, state);
          }

          return state;
        }

        let target: S;

        if (isString(nextState)) {
          target = nextState;
        } else {
          target = nextState.target;

          const { guard } = nextState;

          // If there are guards, invoke them and return early if the transition is denied.
          if (guard && !guard(context)) {
            if (options.verbose) {
              debug(`Transition from "${value}" to "${target}" denied by guard`);
            }

            return state;
          }
        }

        if (options.verbose) {
          debug(`Transition from "${value}" to "${target}"`);
        }

        // Transition to the next state.
        return getState(target, context, options, event);
      default:
        return state;
    }
  };
}

/**
 * @function useStateMachine
 * @description [hook] 状态机
 * @param options 状态机配置
 * @param context 状态机初始上下文
 */
export default function useStateMachine<C, S extends string = string, E extends string = string>(
  options: Options<C, S, E>,
  context: C
): UseStateMachine<C, S, E>;
/**
 * @function useStateMachine
 * @description [hook] 状态机
 * @param options 状态机配置
 */
export default function useStateMachine<C = undefined, S extends string = string, E extends string = string>(
  options: Options<C | undefined, S, E>
): UseStateMachine<C | undefined, S, E>;
/**
 * @function useStateMachine
 * @description [hook] 状态机
 * @param options 状态机配置
 * @param context 状态机初始上下文
 */
export default function useStateMachine<C = undefined, S extends string = string, E extends string = string>(
  options: Options<C | undefined, S, E>,
  context?: C
): UseStateMachine<C | undefined, S, E> {
  const reducer = useMemo(() => {
    return getReducer<C | undefined, S, E>(options);
  }, []);

  const initialState = useMemo(() => {
    return getState(options.initial, context, options);
  }, []);

  const [state, dispatch] = useReducer(reducer, initialState);

  // The public dispatch/send function exposed to the user.
  const send = useCallback<Send<E>>(event => {
    return dispatch({ type: ActionType.Transition, event });
  }, []);

  // The updater function sends an internal event to the reducer to trigger the actual update.
  const update = useCallback<Update<C | undefined>>(updater => {
    return dispatch({ type: ActionType.Update, updater });
  }, []);

  // We are bypassing the linter here because we deliberately want the effects to run on explicit machine state changes.
  useEffect(() => options.states[state.value]?.effect?.(send, update), [state.value]);

  return [state, send, update];
}
