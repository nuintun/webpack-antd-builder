import { isNull } from './utils';

export interface Node<T> {
  value: T;
  prev: Node<T> | null;
  next: Node<T> | null;
}

type Callback<T> = (currentValue: T, index: number, currentLinkedList: LinkedList<T>) => boolean;

function normalizeIndex(size: number, fromIndex: number = 0): number {
  return fromIndex < 0 ? Math.max(0, size + fromIndex) : fromIndex;
}

export default class LinkedList<T> {
  protected size: number = 0;
  protected head: Node<T> | null = null;
  protected tail: Node<T> | null = null;

  public constructor(iterable: Iterable<T> = []) {
    this.push(...iterable);
  }

  protected search(
    callback: Callback<T>,
    reverse?: boolean,
    context?: any
  ): [node: Node<T>, index: number] | [node: undefined, index: -1] {
    const { size } = this;

    if (size > 0) {
      const callbackBound = callback.bind(context);

      if (reverse) {
        let index = size - 1;
        let current = this.tail;

        while (!isNull(current)) {
          if (callbackBound(current.value, index, this)) {
            return [current, index];
          } else {
            current = current.prev;
          }

          index--;
        }
      } else {
        let index = 0;
        let current = this.head;

        while (!isNull(current)) {
          if (callbackBound(current.value, index, this)) {
            return [current, index];
          } else {
            current = current.next;
          }

          index++;
        }
      }
    }

    return [, -1];
  }

  public unshift(...values: T[]) {
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

  public shift(): T | undefined {
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

  public push(...values: T[]) {
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

  public pop(): T | undefined {
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

  public splice(index: number, deleteCount: number, ...values: T[]): T | undefined {
    console.log(index, deleteCount, ...values);

    return undefined;
  }

  public find(callback: Callback<T>, context?: any): T | undefined {
    const [node] = this.search(callback, false, context);

    return node?.value;
  }

  public findIndex(callback: Callback<T>, context?: any): number {
    const [, index] = this.search(callback, false, context);

    return index;
  }

  public at(index: number): T | undefined {
    const { size } = this;
    const position = normalizeIndex(size, index);

    if (position + 1 <= size) {
      const [node] = this.search((_value, index) => {
        return index === position;
      }, position > size / 2);

      return node?.value;
    }
  }

  public includes(valueToFind: T, fromIndex?: number): boolean {
    const { size } = this;
    const position = normalizeIndex(size, fromIndex);

    if (position + 1 <= size) {
      const [, index] = this.search((value, index) => {
        return value === valueToFind && index >= position;
      }, position > size / 2);

      return index >= 0;
    }

    return false;
  }

  public indexOf(valueToFind: T, fromIndex?: number): number {
    const { size } = this;
    const position = normalizeIndex(size, fromIndex);

    if (position + 1 <= size) {
      const [, index] = this.search((value, index) => {
        return value === valueToFind && index >= position;
      });

      return index;
    }

    return -1;
  }

  public lastIndexOf(valueToFind: T, fromIndex?: number): number {
    const { size } = this;
    const position = normalizeIndex(size, fromIndex);

    if (position + 1 <= size) {
      const [, index] = this.search((value, index) => {
        return value === valueToFind && index >= position;
      }, true);

      return index;
    }

    return -1;
  }

  public forEach(callback: Callback<T>, context?: any): void {
    let index = 0;
    let current = this.head;

    const callbackBound = callback.bind(context);

    while (!isNull(current)) {
      callbackBound(current.value, index, this);

      current = current.next;

      index++;
    }
  }

  public values(): Iterator<T> {
    let current = this.head;

    return {
      next: () => {
        if (isNull(current)) {
          return {
            done: true,
            value: undefined
          };
        }

        const { value } = current;

        current = current.next;

        return { done: false, value };
      }
    };
  }

  public get length(): number {
    return this.size;
  }

  public [Symbol.iterator]() {
    return this.values();
  }
}
