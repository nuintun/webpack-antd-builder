/**
 * @module DFSTree
 */

export type Resolve<T> = (node: T) => T[] | void;

export type IteratorValue<T> = [node: T, parent: T | undefined];

/**
 * @class DFSTree
 * @description 深度遍历树
 */
export class DFSTree<T> {
  private tree: T[];

  /**
   * @constructor
   * @description 深度遍历树
   * @param tree 要深度遍历的树
   * @param resolve 子节点获取方法
   */
  constructor(tree: T | T[], private resolve: Resolve<T>) {
    this.tree = Array.isArray(tree) ? tree : [tree];
  }

  /**
   * @method values
   * @description 节点迭代器
   */
  values(): Iterator<IteratorValue<T>, undefined> {
    const { tree, resolve } = this;

    const parents: T[] = [];
    const waiting: Iterator<T, undefined>[] = [];

    let current: Iterator<T, undefined> | undefined = tree.values();

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

            if (children && children.length > 0) {
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

  /**
   * @private iterator
   * @description 内置 for...of 迭代器
   */
  [Symbol.iterator]() {
    return this.values();
  }
}
