/**
 * @module Tree
 */

import { Queue } from './Queue';

export interface Resolve<T> {
  (node: T): T[] | void;
}

export interface OnInternalDone<T> {
  (node: T): void;
}

type IteratorValue<T> = [node: T, parent: T | undefined];

type Waiting<T> = [iterator: Iterator<T, void>, parent?: T];

/**
 * @class DFSTree
 * @description 深度遍历树
 */
export class DFSTree<T> {
  private root: T[];
  private resolve: Resolve<T>;
  private onInternalDone?: OnInternalDone<T>;

  /**
   * @constructor
   * @description 深度遍历树
   * @param tree 要深度遍历的树
   * @param resolve 子节点获取方法
   * @param onInternalDone 内部节点完成时的回调
   */
  constructor(tree: T, resolve: Resolve<T>, onInternalDone?: OnInternalDone<T>) {
    this.root = [tree];
    this.resolve = resolve;
    this.onInternalDone = onInternalDone;
  }

  /**
   * @method values
   * @description 节点迭代器
   */
  *values(): Iterator<IteratorValue<T>, void> {
    const waiting: Waiting<T>[] = [];
    const { root, resolve, onInternalDone } = this;

    let current: Waiting<T> | undefined = [root.values()];

    while (current) {
      const [iterator, parent] = current;
      const item = iterator.next();

      if (item.done) {
        current = waiting.pop();

        if (parent) {
          onInternalDone?.(parent);
        }
      } else {
        const node = item.value;
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

/**
 * @class BFSTree
 * @description 广度遍历树
 */
export class BFSTree<T> {
  private root: T[];
  private resolve: Resolve<T>;
  private onInternalDone?: OnInternalDone<T>;

  /**
   * @constructor
   * @description 广度遍历树
   * @param tree 要广度遍历的树
   * @param resolve 子节点获取方法
   */
  constructor(tree: T, resolve: Resolve<T>, onInternalDone?: OnInternalDone<T>) {
    this.root = [tree];
    this.resolve = resolve;
    this.onInternalDone = onInternalDone;
  }

  /**
   * @method values
   * @description 节点迭代器
   */
  *values(): Iterator<IteratorValue<T>, void> {
    const waiting = new Queue<Waiting<T>>();
    const { root, resolve, onInternalDone } = this;

    let current: Waiting<T> | undefined = [root.values()];

    while (current) {
      const [iterator, parent] = current;
      const item = iterator.next();

      if (item.done) {
        current = waiting.dequeue();

        if (parent) {
          onInternalDone?.(parent);
        }
      } else {
        const node = item.value;
        const children = resolve(node);

        if (children && children.length > 0) {
          waiting.enqueue([children.values(), node]);
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
