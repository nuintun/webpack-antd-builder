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
  private callbacks = new Set<Callback>();

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
   * @description 订阅状态变化
   * @param callback 状态变化回调
   */
  public subscribe(callback: Callback): Callback {
    const { callbacks } = this;

    callbacks.add(callback);

    return () => {
      callbacks.delete(callback);
    };
  }

  /**
   * @method dispatch
   * @description 更新状态
   * @param state 新的状态
   */
  public dispatch(state: React.SetStateAction<S>): void {
    const { state: prevState, callbacks } = this;

    this.state = isFunction(state) ? state(prevState) : state;

    for (const callback of callbacks) {
      callback();
    }
  }
}
