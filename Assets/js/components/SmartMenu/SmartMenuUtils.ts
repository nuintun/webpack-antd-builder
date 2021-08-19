import memoizeOne from 'memoize-one';
import { urlToPaths } from '~js/utils/utils';
import { MenuItem } from '~js/utils/getRouter';

export const prefixUI = 'ui-smart-menu';

/**
 * @function walkMenus
 * @param menus 原始菜单数据
 * @param flatMenus 扁平化菜单数据
 */
function walkMenus(menus: MenuItem[], flatMenus: MenuItem[]): MenuItem[] {
  for (const menu of menus) {
    flatMenus.push(menu);

    const { children } = menu;

    if (children) {
      walkMenus(children, flatMenus);
    }
  }

  return flatMenus;
}

type GetFlatMenus = (menus: MenuItem[]) => MenuItem[];

/**
 * @function getFlatMenus
 * @description 扁平化菜单路由
 * @example [{ path: string }, { path: string }] => [path, path2]
 * @param menus 菜单数据
 */
export const getFlatMenus: GetFlatMenus = memoizeOne(menus => {
  return walkMenus(menus, []);
});

type IsMenuKey = (key: string, flatMenus: MenuItem[]) => boolean;

/**
 * @function isMenuKey
 * @description 指定标识为否为菜单标识
 * @param key 菜单标识
 * @param flatMenus 菜单数据
 */
const isMenuKey: IsMenuKey = memoizeOne((key, flatMenus) => {
  if (!key) return false;

  return flatMenus.some((menu: MenuItem) => key === menu.key);
});

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

type MergeKeys = (prevkeys: string[], nextKeys: string[], flatMenus: MenuItem[]) => string[];

/**
 * @function filterKeys
 * @description 过滤菜单标识
 * @param prevKeys 更新前菜单标识
 * @param nextKeys 更新后菜单标识
 * @param flatMenus 扁平化菜单数据
 */
export const mergeKeys: MergeKeys = memoizeOne((prevKeys, nextKeys, flatMenus) =>
  uniqueKeys([...prevKeys.filter(key => isMenuKey(key, flatMenus)), ...nextKeys])
);

export interface ExpandKeys {
  openKeys: string[];
  selectedKeys: string[];
}

type GetExpandKeysFromPath = (route: string | undefined, flatMenus: MenuItem[]) => ExpandKeys;

/**
 * @function getExpandKeysFromPath
 * @description 通过当前路由获取菜单展开项标识列表
 * @param path 路由路径
 * @param flatMenuPaths 菜单路径列表
 */
export const getExpandKeysFromPath: GetExpandKeysFromPath = memoizeOne((path, flatMenus) => {
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
});
