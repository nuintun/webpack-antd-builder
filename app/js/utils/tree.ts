/**
 * @module tree
 */

interface QueueNode<T> {
  value: T;
  prev: QueueNode<T> | null;
  next: QueueNode<T> | null;
}

type Resolve<T> = (node: T) => T[] | void;

type IteratorValue<T> = [node: T, parent: T | undefined];

type Waiting<T> = [iterator: Iterator<T, undefined>, parent?: T];

/**
 * @class FIFO 队列
 */
class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;

  /**
   * @method enqueue
   * @description 入列
   * @param value 要入列的值
   */
  enqueue(value: T): void {
    const self = this;
    const { tail } = self;

    const node: QueueNode<T> = {
      value,
      next: null,
      prev: tail
    };

    if (tail) {
      tail.next = node;
    } else {
      self.head = node;
    }

    self.tail = node;
  }

  /**
   * @method dequeue
   * @description 出列
   */
  dequeue(): T | undefined {
    const self = this;
    const { head } = self;

    if (head) {
      const { next } = head;

      if (next) {
        next.prev = null;
      } else {
        self.tail = next;
      }

      self.head = next;

      return head.value;
    }
  }
}

/**
 * @class DFSTree
 * @description 深度遍历树
 */
export class DFSTree<T> {
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

/**
 * @class BFSTree
 * @description 广度遍历树
 */
export class BFSTree<T> {
  private root: T[];

  /**
   * @constructor
   * @description 广度遍历树
   * @param tree 要广度遍历的树
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
    const waiting = new Queue<Waiting<T>>();

    let current: Waiting<T> | undefined = [root.values()];

    while (current) {
      const [iterator] = current;
      const item = iterator.next();

      if (item.done) {
        current = waiting.dequeue();
      } else {
        const node = item.value;
        const [, parent] = current;
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
