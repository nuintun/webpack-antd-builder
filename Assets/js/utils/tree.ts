/**
 * @module tree
 */

import { isUndef } from './utils';

export type Resolve<T> = (node: T) => T[] | void;

export type Callback<T> = (node: T, parent?: T) => void;

/**
 * @function preorderTrees
 * @description 树列表前序深度遍历
 * @param trees 树列表
 * @param resolve 获取叶子节点函数
 * @param callback 遍历回调函数
 */
export function preorderTrees<T>(trees: T[], resolve: Resolve<T>, callback: Callback<T>): void {
  const parents: T[] = [];
  const waiting: Iterator<T, undefined>[] = [];

  let current: Iterator<T, undefined> | undefined = trees.values();

  while (!isUndef(current)) {
    const item = current.next();

    if (item.done) {
      parents.pop();

      current = waiting.pop();
    } else {
      const node = item.value;
      const parent = parents[parents.length - 1];

      callback(node, parent);

      const children = resolve(node);

      if (!isUndef(children) && children.length > 0) {
        waiting.push(current);
        parents.push(node);

        current = children.values();
      }
    }
  }
}
