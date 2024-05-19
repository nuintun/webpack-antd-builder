/**
 * @module TreeUpdater
 */

import { DFSTree, Resolve } from './Tree';

interface Match<T> {
  (node: T): boolean;
}

interface Updater<T> {
  (node: T): T;
}

export class TreeUpdater<T> {
  private roots: T[];
  private resolve: Resolve<T>;

  constructor(tree: T | T[], resolve: Resolve<T>) {
    this.resolve = resolve;
    this.roots = Array.isArray(tree) ? tree : [tree];
  }

  public update(match: Match<T>, updater: Updater<T>): T[] {
    const output: T[] = [];
    const { roots, resolve } = this;
    const resolveImpl: Resolve<T> = node => {
      if (!match(node)) {
        return resolve(node);
      }
    };

    for (const root of roots) {
      const mapping = new Map<T, T>();
      const tree = new DFSTree(root, resolveImpl);

      for (const [node, parent] of tree) {
        if (match(node)) {
          console.log(parent);
        } else {
          console.log(mapping, updater);
        }
      }
    }

    return output;
  }
}
