/**
 * @module compose
 */

interface CallStack {
  index: number;
  done: boolean;
}

export type Next = () => Promise<void>;

export type Middleware<C> = (context: C, next: Next) => Promise<void> | void;

export type ComposedMiddleware<C> = (context: C, next?: Next) => Promise<void>;

/**
 * @function dispatch
 * @param middlewares 中间件数组
 * @param index 要执行的中间件索引
 * @param stack 调用栈信息
 * @param context 执行上下文
 * @param [next] 下一个中间件
 */
async function dispatch<C>(
  middlewares: Middleware<C>[],
  index: number,
  stack: CallStack,
  context: C,
  next?: Next
): Promise<void> {
  if (index <= stack.index) {
    throw new Error('next() called multiple times');
  }

  stack.index = index;

  const { length } = middlewares;

  if (!stack.done && index <= length) {
    stack.done = index === length;

    if (!stack.done) {
      const middleware = middlewares[index];

      return middleware(context, () => dispatch(middlewares, index + 1, stack, context, next));
    } else if (next) {
      return next();
    }
  }
}

/**
 * @function compose
 * @description 生成融合中间件
 * @param middlewares 中间件数组
 */
export default function compose<C>(middlewares: Middleware<C>[]): ComposedMiddleware<C> {
  /**
   * @function middleware
   * @description 融合中间件
   * @param context 执行上下文
   * @param [next] 下一个中间件
   */
  return async (context, next) => {
    await dispatch<C>(middlewares, 0, { index: -1, done: false }, context, next);
  };
}
