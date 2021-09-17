/**
 * @module compose
 */

export type Next = () => Promise<void>;

export type Compose<C> = (context: C) => Promise<void>;

export type Middleware<C> = (context: C, next: Next) => Promise<void> | void;

/**
 * @function dispatch
 * @param middlewares 中间件数组
 * @param index 要执行的中间件索引
 * @param current 正在执行的中间件信息
 * @param context 执行上下文
 */
async function dispatch<C>(middlewares: Middleware<C>[], index: number, current: { index: number }, context: C): Promise<void> {
  if (index <= current.index) {
    throw new Error('next() called multiple times');
  }

  current.index = index;

  if (index < middlewares.length) {
    const middleware = middlewares[index];

    return middleware(context, () => dispatch(middlewares, index + 1, current, context));
  }
}

/**
 * @function compose
 * @description 获取以洋葱圈方式执行中间件的方法
 * @param middlewares 中间件数组
 */
export default function compose<C>(middlewares: Middleware<C>[]): Compose<C> {
  /**
   * @function dispatch
   * @description 以洋葱圈方式执行中间件
   * @param context 执行上下文
   */
  return context => dispatch(middlewares, 0, { index: -1 }, context);
}
