/**
 * @module DFSTree
 */

type Resolve<T> = (node: T) => T[] | void;

type IteratorValue<T> = [node: T, parent: T | undefined];

type Waiting<T> = [iterator: Iterator<T, undefined>, parent?: T];

/**
 * @class DFSTree
 * @description 深度遍历树
 */
export default class DFSTree<T> {
  private root: T[];

  /**
   * @constructor
   * @description 深度遍历树
   * @param tree 要深度遍历的树
   * @param resolve 子节点获取方法
   */
  constructor(tree: T, private resolve: Resolve<T>) {
    this.root = [tree];
  }

  /**
   * @method values
   * @description 节点迭代器
   */
  *values(): Iterator<IteratorValue<T>, void> {
    const { root, resolve } = this;
    const waiting: Waiting<T>[] = [];

    let current: Waiting<T> | undefined = [root.values()];

    while (current) {
      const [iterator] = current;
      const item = iterator.next();

      if (item.done) {
        current = waiting.pop();
      } else {
        const node = item.value;
        const [, parent] = current;
        const children = resolve(node);

        if (children && children.length > 0) {
          waiting.push(current);

          current = [children.values(), node];
        }

        yield [node, parent];
      }
    }
  }

  /**
   * @private iterator
   * @description 内置 for...of 迭代器
   */
  [Symbol.iterator]() {
    return this.values();
  }
}
