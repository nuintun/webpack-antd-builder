/**
 * @module tree
 */

export type Resolve<T> = (node: T) => T[] | void;

export type Callback<T> = (node: T, parentNode?: T) => void;

/**
 * @function preorderTrees
 * @description 树列表前序深度遍历
 * @param trees 树列表
 * @param resolve 获取叶子节点函数
 * @param callback 遍历回调函数
 */
export function preorderTrees<T>(trees: T[], resolve: Resolve<T>, callback: Callback<T>): void {
  const parentNodes: T[] = [];
  const waiting: Iterator<T, T>[] = [];

  let current: Iterator<T, T> | undefined = trees.values();

  while (current) {
    const { done, value: node } = current.next();

    if (done) {
      parentNodes.pop();

      current = waiting.pop();
    } else {
      const parentNode = parentNodes[parentNodes.length - 1];

      callback(node, parentNode);

      const childNodes = resolve(node);

      if (childNodes && childNodes.length > 0) {
        waiting.push(current);
        parentNodes.push(node);

        current = childNodes.values();
      }
    }
  }
}
