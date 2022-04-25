import { DFSTree } from '/js/utils/tree';
import { MenuItem } from '/js/utils/router';

export interface ExpandKeys {
  openKeys: string[];
  selectedKeys: string[];
}

export type FlattenMenuItem<T> = MenuItem<T & { parent?: string }>;

export interface FlattenItems<T> {
  [path: string]: FlattenMenuItem<T>;
}

export const prefixUI = 'ui-smart-menu';

/**
 * @function filterKeys
 * @description 菜单标识去重
 * @param keys 菜单标识
 */
function uniqueKeys(keys: string[]): string[] {
  const result: string[] = [];
  const cached: Record<string, boolean> = {};

  for (const key of keys) {
    if (!cached[key]) {
      result.push(key);

      cached[key] = true;
    }
  }

  return result;
}

/**
 * @function flattenItems
 * @description 扁平化菜单数据
 * @param items 菜单数据
 */
export function flattenItems<T>(items: MenuItem<T>[]): FlattenItems<T> {
  const flatItems: FlattenItems<T> = {};

  for (const item of items) {
    const tree = new DFSTree(item, item => item.children);

    for (const [item, parent] of tree) {
      if (parent) {
        flatItems[item.path] = {
          ...item,
          parent: parent.path
        };
      } else {
        flatItems[item.path] = item;
      }
    }
  }

  return flatItems;
}

/**
 * @function filterKeys
 * @description 过滤菜单标识
 * @param prevKeys 更新前菜单标识
 * @param nextKeys 更新后菜单标识
 */
export function mergeKeys(prevKeys: string[], nextKeys: string[]): string[] {
  return uniqueKeys([...prevKeys, ...nextKeys]);
}

/**
 * @function getExpandKeys
 * @description 通过当前路由获取菜单展开项标识列表
 * @param path 路由路径
 * @param flatItems 扁平化菜单数据
 */
export function getExpandKeys<T>(path: string, flatItems: FlattenItems<T>): ExpandKeys {
  const openKeys: string[] = [];
  const selectedKeys: string[] = [];

  let current = flatItems[path];

  while (current) {
    const { key, children } = current;

    if (children && children.length > 0) {
      openKeys.push(key);
    } else {
      selectedKeys.push(key);
    }

    const { parent } = current;

    if (parent === undefined) {
      break;
    } else {
      current = flatItems[parent];
    }
  }

  return { openKeys, selectedKeys };
}
