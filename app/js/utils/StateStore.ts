/**
 * @module StateStore
 */

import { isFunction } from './utils';

export interface Callback {
  (): void;
}

/**
 * @class StateStore
 */
export class StateStore<S> {
  private state: S;
  private dispatches = new Set<Callback>();

  /**
   * @constructor
   * @param initialState 初始状态
   */
  constructor(initialState: S) {
    this.state = initialState;
  }

  /**
   * @method getState
   * @description 获取当前状态
   */
  public getState(): S {
    return this.state;
  }

  /**
   * @method subscribe
   * @description 订阅状态
   * @param callback 状态变化回调
   */
  public subscribe(callback: Callback): Callback {
    const { dispatches } = this;

    dispatches.add(callback);

    return () => {
      dispatches.delete(callback);
    };
  }

  /**
   * @method dispatch
   * @description 更新状态
   * @param state 新的状态
   */
  public dispatch(state: React.SetStateAction<S>): void {
    const { state: prevState, dispatches } = this;

    this.state = isFunction(state) ? state(prevState) : state;

    for (const dispatch of dispatches) {
      dispatch();
    }
  }
}
