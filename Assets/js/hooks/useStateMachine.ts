/**
 * @module useStateMachine
 * @see https://github.com/cassiozen/useStateMachine
 */

import { isFunction } from '~js/utils/utils';
import { Dispatch, useEffect, useReducer, useRef } from 'react';

type ContextUpdate<Context> = (context: Context) => Context;

type Transition<Context, S extends string> = S | { target: S; guard?: (context: Context) => boolean };

interface MachineStateOptions<Context, S extends string, T extends string> {
  on?: {
    [key in T]?: Transition<Context, S>;
  };
  effect?: (
    send: Dispatch<T>,
    assign: Dispatch<ContextUpdate<Context>>
  ) => void | ((send: Dispatch<T>, assign: Dispatch<ContextUpdate<Context>>) => void);
}

interface MachineOptions<Context, S extends string, T extends string> {
  initial: S;
  verbose?: boolean;
  states: {
    [key in S]: MachineStateOptions<Context, S, T>;
  };
}

interface State<Context, S extends string, T extends string> {
  value: S;
  nextEvents: T[];
  context: Context;
}

interface UpdateEvent<Context> {
  type: 'Update';
  updater: (context: Context) => Context;
}

interface TransitionEvent<T extends string> {
  type: 'Transition';
  next: T;
}

type Event<Context, T extends string> = UpdateEvent<Context> | TransitionEvent<T>;

type UseStateMachine<Context, S extends string, T extends string> = [state: State<Context, S, T>, send: Dispatch<T>];

function debug(message: string, ...data: any[]) {
  if (process.env.NODE_ENV === 'development') {
    // Console.log clearly accepts parameters other than string, but TypeScript is complaining, so...
    debug(`%cuseStateMachine %c${message}`, 'color: #888;', 'color: default;', ...data);
  }
}

function useConstant<T>(init: () => T): T {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = init();
  }

  return ref.current;
}

function getState<Context, S extends string, T extends string>(
  context: Context,
  config: MachineOptions<Context, S, T>,
  value: S
): State<Context, S, T> {
  const on = config.states[value].on;

  return {
    value,
    context,
    nextEvents: on ? (Object.keys(on) as T[]) : []
  };
}

function getReducer<Context, S extends string, T extends string>(config: MachineOptions<Context, S, T>) {
  return function reducer(state: State<Context, S, T>, event: Event<Context, T>): State<Context, S, T> {
    if (event.type === 'Update') {
      // Internal action to update context
      const nextContext = event.updater(state.context);

      if (config.verbose) {
        debug('Context update from %o to %o', state.context, nextContext);
      }

      return {
        value: state.value,
        context: nextContext,
        nextEvents: state.nextEvents
      };
    } else {
      const currentState = config.states[state.value];
      const nextState: Transition<Context, S> | undefined = currentState.on?.[event.next];

      // If there is no defined next state, return early
      if (!nextState) {
        if (config.verbose) {
          debug(`Current state %o doesn't listen to event "${event.next}".`, state);
        }

        return state;
      }

      let target: S;

      if (typeof nextState === 'string') {
        target = nextState;
      } else {
        target = nextState.target;
        // If there are guards, invoke them and return early if the transition is denied
        if (nextState.guard && !nextState.guard(state.context)) {
          if (config.verbose) {
            debug(`Transition from "${state.value}" to "${target}" denied by guard`);
          }

          return state;
        }
      }

      if (config.verbose) {
        debug(`Transition from "${state.value}" to "${target}"`);
      }

      return getState(state.context, config, target);
    }
  };
}

/**
 * @function useStateMachine
 * @description 【Hook】状态机
 * @param options 状态机配置
 * @param context 状态机初始上下文
 */
export default function useStateMachine<Context, S extends string, T extends string>(
  options: MachineOptions<Context, S, T>
): UseStateMachine<undefined, S, T>;
export default function useStateMachine<Context, S extends string, T extends string>(
  options: MachineOptions<Context, S, T>,
  context: Context
): UseStateMachine<Context, S, T>;
export default function useStateMachine<Context, S extends string, T extends string>(
  options: MachineOptions<Context, S, T>,
  context?: Context
): UseStateMachine<Context | undefined, S, T> {
  const initialState = useConstant<State<Context, S, T>>(() => getState(context as Context, options, options.initial));

  const reducer = useConstant(() => getReducer<Context, S, T>(options));

  const [machine, dispatch] = useReducer(reducer, initialState);

  // The updater function sends an internal event to the reducer to trigger the actual update
  const update: Dispatch<ContextUpdate<Context>> = updater => dispatch({ type: 'Update', updater });

  // The public dispatch/send function exposed to the user
  const send: Dispatch<T> = useConstant(() => next => dispatch({ type: 'Transition', next }));

  useEffect(() => {
    const exit = options.states[machine.value]?.effect?.(send, update);

    return isFunction(exit) ? () => exit(send, update) : undefined;
    // We are bypassing the linter here because we deliberately want the effects to run on explicit machine state changes.
  }, [machine.value]);

  return [machine, send];
}
