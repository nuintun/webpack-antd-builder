/**
 * @class Queue
 */

interface Node<T> {
  value: T;
  next: Node<T> | null;
}

/**
 * @class FIFO 队列
 */
export class Queue<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  /**
   * @method enqueue
   * @description 入列
   * @param value 要入列的值
   */
  enqueue(value: T): void {
    const self = this;
    const { tail } = self;
    const node: Node<T> = {
      value,
      next: null
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

      self.head = next;

      if (!next) {
        self.tail = next;
      }

      return head.value;
    }
  }
}
