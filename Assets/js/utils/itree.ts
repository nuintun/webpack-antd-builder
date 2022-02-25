/**
 * @module itree
 */

export type Resolve<T> = (node: T) => T[] | void;

export type IteratorValue<T> = [node: T, parent: T | undefined];

/**
 * @function preorder
 * @description 树前序迭代器
 * @param trees 要迭代的树
 * @param resolve 树子节点获取方法
 */
export function preorder<T>(trees: T | T[], resolve: Resolve<T>): Iterator<IteratorValue<T>, undefined> {
  const parents: T[] = [];
  const waiting: Iterator<T, undefined>[] = [];
  const roots = Array.isArray(trees) ? trees : [trees];

  let current: Iterator<T, undefined> | undefined = roots.values();

  return {
    next() {
      if (current) {
        const item = current.next();

        if (item.done) {
          parents.pop();

          current = waiting.pop();
        } else {
          const node = item.value;
          const children = resolve(node);
          const parent = parents[parents.length - 1];

          if (Array.isArray(children) && children.length > 0) {
            parents.push(node);
            waiting.push(current);

            current = children.values();
          }

          return { done: false, value: [node, parent] };
        }
      }

      return { done: true, value: undefined };
    }
  };
}
