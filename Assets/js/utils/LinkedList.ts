import { isNull } from './utils';

export interface Node<T> {
  value: T;
  prev: Node<T> | null;
  next: Node<T> | null;
}

type Callback<T> = (value: T, index: number, self: LinkedList<T>) => boolean;

export default class LinkedList<T> {
  private size: number = 0;
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  constructor(iterable: Iterable<T> = []) {
    this.push(...iterable);
  }

  unshift(...values: T[]) {
    for (const value of values) {
      const { head } = this;
      const node: Node<T> = {
        value,
        prev: null,
        next: head
      };

      this.head = node;

      if (isNull(head)) {
        this.tail = node;
      } else {
        head.prev = node;
      }

      this.size++;
    }
  }

  shift(): T | undefined {
    const { head } = this;

    if (!isNull(head)) {
      const { next } = head;

      this.head = next;

      if (isNull(next)) {
        this.tail = next;
      }

      this.size--;

      return head.value;
    }
  }

  push(...values: T[]) {
    for (const value of values) {
      const { tail } = this;
      const node: Node<T> = {
        value,
        prev: tail,
        next: null
      };

      if (isNull(tail)) {
        this.head = node;
      } else {
        tail.next = node;
      }

      this.tail = node;

      this.size++;
    }
  }

  pop(): T | undefined {
    const { tail } = this;

    if (!isNull(tail)) {
      const { prev } = tail;

      if (isNull(prev)) {
        this.head = prev;
      }

      this.tail = prev;

      this.size--;

      return tail.value;
    }
  }

  splice(index: number, count: number, ...values: T[]): T | undefined {
    console.log(index, count, ...values);

    return undefined;
  }

  private search(callback: Callback<T>, context: any = this): [value: Node<T>, index: number] | [value: undefined, index: -1] {
    let index = 0;
    let current = this.head;

    const callbackBound = callback.bind(context);

    while (!isNull(current)) {
      if (callbackBound(current.value, index, this)) {
        return [current, index];
      } else {
        current = current.next;
      }

      index++;
    }

    return [, -1];
  }

  find(callback: Callback<T>, context: any = this): T | undefined {
    const [node] = this.search(callback, context);

    return node?.value;
  }

  findIndex(callback: Callback<T>, context: any = this): number {
    const [, index] = this.search(callback, context);

    return index;
  }

  get length(): number {
    return this.size;
  }
}
