import { DFSTree } from '/js/utils/tree';
import { IRoute } from '/js/utils/router';
import { MenuItem } from '/js/utils/menus';

export interface ExpandKeys {
  openKeys: string[];
  selectedKeys: string[];
}

export interface FlattenItems {
  [key: string]: MenuItem;
}

export const prefixUI = 'ui-smart-menu';

/**
 * @function filterKeys
 * @description 菜单标识去重
 * @param keys 菜单标识
 */
export function uniqueKeys(keys: string[]): string[] {
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
 * @param menus 菜单数据
 */
export function flattenItems(menus: MenuItem[]): FlattenItems {
  const flatMenus: FlattenItems = {};

  for (const menu of menus) {
    const tree = new DFSTree(menu, menu => menu.children);

    for (const [menu] of tree) {
      flatMenus[menu.key] = menu;
    }
  }

  return flatMenus;
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
 * @param matches 匹配的路由数据
 * @param flatMenus 扁平化菜单数据
 */
export function getExpandKeys(matches: IRoute[], flatMenus: FlattenItems): ExpandKeys {
  const openKeys: string[] = [];
  const selectedKeys: string[] = [];

  for (const match of matches) {
    const { key } = match.meta;
    const menu = flatMenus[key];

    if (menu) {
      const { children } = menu;

      if (children && children.length > 0) {
        openKeys.push(key);
      } else {
        selectedKeys.push(key);
      }
    }
  }

  return { openKeys, selectedKeys };
}
