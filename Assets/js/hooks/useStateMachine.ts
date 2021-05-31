/**
 * @module useStateMachine
 * @see https://github.com/cassiozen/useStateMachine
 */

import { isFunction } from '~js/utils/utils';
import { Dispatch, useEffect, useReducer, useRef } from 'react';

type ContextUpdate<C> = (context: C) => C;

type Transition<C, S extends string> = S | { target: S; guard?: (context: C) => boolean };

interface MachineStateOptions<C, S extends string, E extends string> {
  on?: {
    [key in E]?: Transition<C, S>;
  };
  effect?: (
    send: Dispatch<E>,
    assign: Dispatch<ContextUpdate<C>>
  ) => void | ((send: Dispatch<E>, assign: Dispatch<ContextUpdate<C>>) => void);
}

interface MachineOptions<C, S extends string, E extends string> {
  initial: S;
  verbose?: boolean;
  states: {
    [key in S]: MachineStateOptions<C, S, E>;
  };
}

interface State<C, S extends string, E extends string> {
  value: S;
  nextEvents: E[];
  context: C;
}

interface UpdateEvent<C> {
  type: 'Update';
  updater: (context: C) => C;
}

interface TransitionEvent<E extends string> {
  type: 'Transition';
  next: E;
}

type Event<C, E extends string> = UpdateEvent<C> | TransitionEvent<E>;

type UseStateMachine<C, S extends string, E extends string> = [state: State<C, S, E>, send: Dispatch<E>];

function debug(message: string, ...data: any[]) {
  if (process.env.NODE_ENV === 'development') {
    // Console.log clearly accepts parameters other than string, but TypeScript is complaining, so...
    debug(`%cuseStateMachine %c${message}`, 'color: #888;', 'color: default;', ...data);
  }
}

function useConstant<E>(init: () => E): E {
  const ref = useRef<E | null>(null);

  if (ref.current === null) {
    ref.current = init();
  }

  return ref.current;
}

function getState<C, S extends string, E extends string>(
  context: C,
  config: MachineOptions<C, S, E>,
  value: S
): State<C, S, E> {
  const on = config.states[value].on;

  return {
    value,
    context,
    nextEvents: on ? (Object.keys(on) as E[]) : []
  };
}

function getReducer<C, S extends string, E extends string>(config: MachineOptions<C, S, E>) {
  return function reducer(state: State<C, S, E>, event: Event<C, E>): State<C, S, E> {
    if (event.type === 'Update') {
      // Internal action to update context
      const nextContext = event.updater(state.context);

      if (config.verbose) {
        debug('C update from %o to %o', state.context, nextContext);
      }

      return {
        value: state.value,
        context: nextContext,
        nextEvents: state.nextEvents
      };
    } else {
      const currentState = config.states[state.value];
      const nextState: Transition<C, S> | undefined = currentState.on?.[event.next];

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
export default function useStateMachine<C, S extends string, E extends string>(
  options: MachineOptions<C, S, E>
): UseStateMachine<undefined, S, E>;
export default function useStateMachine<C, S extends string, E extends string>(
  options: MachineOptions<C, S, E>,
  context: C
): UseStateMachine<C, S, E>;
export default function useStateMachine<C, S extends string, E extends string>(
  options: MachineOptions<C, S, E>,
  context?: C
): UseStateMachine<C | undefined, S, E> {
  const initialState = useConstant<State<C, S, E>>(() => getState(context as C, options, options.initial));

  const reducer = useConstant(() => getReducer<C, S, E>(options));

  const [machine, dispatch] = useReducer(reducer, initialState);

  // The updater function sends an internal event to the reducer to trigger the actual update
  const update: Dispatch<ContextUpdate<C>> = updater => dispatch({ type: 'Update', updater });

  // The public dispatch/send function exposed to the user
  const send: Dispatch<E> = useConstant(() => next => dispatch({ type: 'Transition', next }));

  useEffect(() => {
    const exit = options.states[machine.value]?.effect?.(send, update);

    return isFunction(exit) ? () => exit(send, update) : undefined;
    // We are bypassing the linter here because we deliberately want the effects to run on explicit machine state changes.
  }, [machine.value]);

  return [machine, send];
}
