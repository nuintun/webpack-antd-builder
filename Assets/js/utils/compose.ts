/**
 * @module compose
 */

export type Next = () => Promise<void>;

export type Compose<C> = (context: C) => Promise<void>;

export type Middleware<C> = (context: C, next: Next) => Promise<void> | void;

/**
 * @function compose
 * @description 生成中间件洋葱圈模型
 * @param middlewares 中间件数组
 */
export default function compose<C>(middlewares: Middleware<C>[]): Compose<C> {
  const dispatch = async (index: number, current: { index: number }, context: C): Promise<void> => {
    if (index <= current.index) {
      throw new Error('next() called multiple times');
    }

    current.index = index;

    if (index < middlewares.length) {
      const middleware = middlewares[index];

      return middleware(context, () => dispatch(index + 1, current, context));
    }
  };

  return context => dispatch(0, { index: -1 }, context);
}
