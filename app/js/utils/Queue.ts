/**
 * @module Queue
 */

/**
 * @interface Node
 * @description 队列节点
 */
export interface Node<T> {
  value: T;
  next: Node<T> | null;
}

/**
 * @class Queue
 * @description 高性能链表队列
 */
export class Queue<T> {
  #head: Node<T> | null = null;
  #tail: Node<T> | null = null;

  /**
   * @method enqueue
   * @description 入队
   * @param value 入队元素
   */
  enqueue(value: T): void {
    const tail = this.#tail;
    const node: Node<T> = {
      value,
      next: null
    };

    if (tail !== null) {
      tail.next = node;
    } else {
      this.#head = node;
    }

    this.#tail = node;
  }

  /**
   * @method dequeue
   * @description 出队
   */
  dequeue(): T | undefined {
    const head = this.#head;

    if (head !== null) {
      const next = head.next;

      this.#head = next;

      if (next === null) {
        this.#tail = null;
      }

      head.next = null;

      return head.value;
    }
  }
}
