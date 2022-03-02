import DFSTree from '/js/utils/DFSTree';
import { isUndef } from '/js/utils/utils';
import { MenuItem } from '/js/utils/router';

export interface ExpandKeys {
  openKeys: string[];
  selectedKeys: string[];
}

export type FlattenMenuItem<T> = MenuItem<T & { parent?: string }>;

export interface FlattenMenus<T> {
  [path: string]: FlattenMenuItem<T>;
}

export const prefixUI = 'ui-smart-menu';

/**
 * @function isMenuKey
 * @description 指定标识为否为菜单标识
 * @param key 菜单标识
 * @param flatMenus 菜单数据
 */
function isMenuKey<T>(key: string, flatMenus: FlattenMenus<T>): boolean {
  return key ? !!flatMenus[key] : false;
}

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
 * @function flattenMenus
 * @description 扁平化菜单数据
 * @param menus 菜单数据
 */
export function flattenMenus<T>(menus: MenuItem<T>[]): FlattenMenus<T> {
  const flatMenus: FlattenMenus<T> = {};

  for (const menu of menus) {
    const tree = new DFSTree(menu, menu => menu.children);

    for (const [menu, parent] of tree) {
      if (parent) {
        flatMenus[menu.path] = {
          ...menu,
          parent: parent.path
        };
      } else {
        flatMenus[menu.path] = menu;
      }
    }
  }

  return flatMenus;
}

/**
 * @function filterKeys
 * @description 过滤菜单标识
 * @param prevKeys 更新前菜单标识
 * @param nextKeys 更新后菜单标识
 * @param flatMenus 扁平化菜单数据
 */
export function mergeKeys<T>(prevKeys: string[], nextKeys: string[], flatMenus: FlattenMenus<T>): string[] {
  return uniqueKeys([...prevKeys.filter(key => isMenuKey(key, flatMenus)), ...nextKeys]);
}

/**
 * @function getExpandKeys
 * @description 通过当前路由获取菜单展开项标识列表
 * @param path 路由路径
 * @param flatMenus 扁平化菜单数据
 */
export function getExpandKeys<T>(path: string, flatMenus: FlattenMenus<T>): ExpandKeys {
  const openKeys: string[] = [];
  const selectedKeys: string[] = [];

  let current = flatMenus[path];

  while (current) {
    const key = current.key.toString();

    if (current.children) {
      openKeys.push(key);
    } else {
      selectedKeys.push(key);
    }

    const { parent } = current;

    if (isUndef(parent)) {
      break;
    } else {
      current = flatMenus[parent];
    }
  }

  return { openKeys, selectedKeys };
}
