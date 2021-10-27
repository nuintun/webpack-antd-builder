import { urlToPaths } from '~js/utils/utils';
import { preorderTrees } from '~js/utils/tree';
import { MenuItem } from '~js/utils/parseRouter';

export interface ExpandKeys {
  openKeys: string[];
  selectedKeys: string[];
}

/**
 * @function isMenuKey
 * @description 指定标识为否为菜单标识
 * @param key 菜单标识
 * @param flatMenus 菜单数据
 */
function isMenuKey<T>(key: string, flatMenus: MenuItem<T>[]): boolean {
  if (!key) return false;

  return flatMenus.some(menu => key === menu.key);
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

export const prefixUI = 'ui-smart-menu';

/**
 * @function flattenMenus
 * @description 扁平化菜单路由
 * @example [{ path: string }, { path: string }] => [path, path2]
 * @param menus 菜单数据
 */
export function flattenMenus<T>(menus: MenuItem<T>[]): MenuItem<T>[] {
  const flatMenus: MenuItem<T>[] = [];

  preorderTrees(
    menus,
    menu => menu.children,
    menu => flatMenus.push(menu)
  );

  return flatMenus;
}

/**
 * @function filterKeys
 * @description 过滤菜单标识
 * @param prevKeys 更新前菜单标识
 * @param nextKeys 更新后菜单标识
 * @param flatMenus 扁平化菜单数据
 */
export function mergeKeys<T>(prevKeys: string[], nextKeys: string[], flatMenus: MenuItem<T>[]): string[] {
  return uniqueKeys([...prevKeys.filter(key => isMenuKey(key, flatMenus)), ...nextKeys]);
}

/**
 * @function getExpandKeys
 * @description 通过当前路由获取菜单展开项标识列表
 * @param path 路由路径
 * @param flatMenus 扁平化菜单数据
 */
export function getExpandKeys<T>(path: string | undefined, flatMenus: MenuItem<T>[]): ExpandKeys {
  const openKeys: string[] = [];
  const selectedKeys: string[] = [];

  if (path) {
    const paths = urlToPaths(path.toLowerCase());

    for (const path of paths) {
      for (const menu of flatMenus) {
        if (path === menu.path) {
          if (menu.children) {
            openKeys.push(menu.key.toString());
          } else {
            selectedKeys.push(menu.key.toString());
          }
        }
      }
    }
  }

  return { openKeys, selectedKeys };
}
