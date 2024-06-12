/**
 * @module useStateMachine
 * @see https://github.com/cassiozen/useStateMachine
 */

import { isFunction, isString } from '/js/utils/utils';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

const enum ActionType {
  Update,
  Transition
}

interface ContextUpdater<C> {
  (context: C): C;
}

interface UpdateAction<C> {
  type: ActionType.Update;
  context: C | ContextUpdater<C>;
}

export interface Update<C> {
  (context: C | ContextUpdater<C>): void;
}

export interface Send<E extends string> {
  (event: E): void;
}

interface TransitionAction<E extends string> {
  type: ActionType.Transition;
  event: E;
}

export interface State<C, S extends string, E extends string> {
  /**
   * @description Returns the name of the current state.
   */
  readonly value: S;
  /**
   * @description The name of the last sent event that led to this state.
   */
  readonly event?: E;
  /**
   * @description The state machine context state.
   */
  readonly context: C;
  /**
   * @description An array with the names of available events to trigger transitions from this state.
   */
  readonly nextEvents: E[];
}

export interface Guard<C, S extends string, E extends string> {
  (state: S, event: E, context: C): boolean;
}

export interface Options<C, S extends string, E extends string> {
  initial: S;
  verbose?: boolean;
  states: {
    [K in S]: StateOptions<C, S, E>;
  };
}

interface Reducer<C, S extends string, E extends string> {
  (state: State<C, S, E>, action: Action<C, E>): State<C, S, E>;
}

export interface StateOptions<C, S extends string, E extends string> {
  on?: {
    [key in E]?: Transition<C, S, E>;
  };
  effect?: (send: Send<E>, update: Update<C>) => EffectReturn;
}

type EffectReturn = void | (() => void) | Promise<void | (() => void)>;

type Action<C, E extends string> = UpdateAction<C> | TransitionAction<E>;

type Transition<C, S extends string, E extends string> = S | { target: S; guard?: Guard<C, S, E> };

type UseStateMachine<C, S extends string, E extends string> = [state: State<C, S, E>, send: Send<E>, update: Update<C>];

function getState<C, S extends string, E extends string>(
  value: S,
  context: C,
  options: Options<C, S, E>,
  event?: E,
  nextEvents?: E[]
): State<C, S, E> {
  if (!nextEvents) {
    const { on } = options.states[value];

    nextEvents = (on ? Object.keys(on) : []) as E[];
  }

  return { value, event, context, nextEvents };
}

function debug(message: string, ...data: any[]): void {
  console.log(
    `%cuseStateMachine%c ${message}`,
    'padding: 3px 6px; border-radius: 3px; border: 1px solid #67c23a; color: #67c23a;',
    'background: inherit; color: inherit;',
    ...data
  );
}

function getReducer<C, S extends string, E extends string>(options: Options<C, S, E>): Reducer<C, S, E> {
  return function reducer(state: State<C, S, E>, action: Action<C, E>): State<C, S, E> {
    const { verbose } = options;
    const { value, context } = state;

    switch (action.type) {
      case ActionType.Update:
        const { context: update } = action;
        // Internal action to update context.
        const nextContext = isFunction(update) ? update(context) : update;

        if (verbose) {
          debug('Context update from %o to %o', context, nextContext);
        }

        return getState(value, nextContext, options, state.event, state.nextEvents);
      case ActionType.Transition:
        const { event } = action;
        const { on } = options.states[value];
        const nextState: Transition<C, S, E> | undefined = on?.[event];

        // If there is no defined next state, return early.
        if (!nextState) {
          if (verbose) {
            debug(`Current state %o doesn't listen to event "${event}"`, state);
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
          if (guard && !guard(value, event, context)) {
            if (verbose) {
              debug(`Transition from "${value}" to "${target}" denied by guard`);
            }

            return state;
          }
        }

        if (verbose) {
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
  const update = useCallback<Update<C | undefined>>(context => {
    return dispatch({ type: ActionType.Update, context });
  }, []);

  // We are bypassing the linter here because we deliberately want the effects to run on explicit machine state changes.
  useEffect(() => {
    const returned = (async () => {
      const { effect } = options.states[state.value];

      return await effect?.(send, update);
    })();

    return () => {
      returned.then(async exit => {
        if (isFunction(exit)) {
          await exit();
        }
      });
    };
  }, [state.value]);

  return [state, send, update];
}
