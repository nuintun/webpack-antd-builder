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
  return context => {
    let current = -1;

    const dispatch = async (index: number): Promise<void> => {
      if (index <= current) {
        throw new Error('next() called multiple times');
      }

      current = index;

      if (index < middlewares.length) {
        const middleware = middlewares[index];

        return middleware(context, () => dispatch(index + 1));
      }
    };

    return dispatch(0);
  };
}
