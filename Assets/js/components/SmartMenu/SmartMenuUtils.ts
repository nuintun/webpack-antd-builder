import memoizeOne from 'memoize-one';
import { urlToPaths } from '~js/utils/utils';
import { MenuItem } from '~js/utils/getRouter';

export const prefixUI = 'ui-smart-menu';

/**
 * @function walkMenuData
 * @param {MenuItem[]} menuData
 * @param {FlatMenuData} flatMenus
 * @returns {FlatMenuData}
 */
function walkMenuData(menuData: MenuItem[], flatMenuData: MenuItem[]): MenuItem[] {
  for (const menu of menuData) {
    flatMenuData.push(menu);

    const { children } = menu;

    if (children) {
      walkMenuData(children, flatMenuData);
    }
  }

  return flatMenuData;
}

type GetFlatMenuData = (menuData: MenuItem[]) => MenuItem[];

/**
 * @function getFlatMenuData
 * @description 扁平化菜单路由
 * @example [{ path: string }, { path: string }] => [path, path2]
 * @param {MenuItem[]} menuData
 * @returns {string[]}
 */
export const getFlatMenuData: GetFlatMenuData = memoizeOne(menuData => {
  return walkMenuData(menuData, []);
});

type IsMenuKey = (key: string, flatMenuData: MenuItem[]) => boolean;

/**
 * @function isMenuKey
 * @description 指定标识为否为菜单标识
 * @param {string} key
 * @param {MenuItem[]} flatMenuData
 * @returns {boolean}
 */
const isMenuKey: IsMenuKey = memoizeOne((key, flatMenuData) => {
  if (!key) return false;

  return flatMenuData.some((menu: MenuItem) => key === menu.key);
});

/**
 * @function filterKeys
 * @description 菜单标识去重
 * @param {string[]} keys
 * @returns {string[]}
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

type MergeKeys = (prevkeys: string[], nextKeys: string[], flatMenuData: MenuItem[]) => string[];

/**
 * @function filterKeys
 * @description 过滤菜单标识
 * @param {string[]} prevKeys
 * @param {string[]} nextKeys
 * @param {MenuItem[]} flatMenuData
 * @returns {string[]}
 */
export const mergeKeys: MergeKeys = memoizeOne((prevKeys, nextKeys, flatMenuData) =>
  uniqueKeys([...prevKeys.filter(key => isMenuKey(key, flatMenuData)), ...nextKeys])
);

export interface ExpandKeys {
  openKeys: string[];
  selectedKeys: string[];
}

type GetExpandKeysFromRouteMath = (path: string | undefined, flatMenuData: MenuItem[]) => ExpandKeys;

/**
 * @function getExpandKeysFromRouteMath
 * @description 通过当前路由获取菜单展开项标识列表
 * @param {string|undefined} path
 * @param {MenuItem[]} flatMenuPaths
 * @returns {MenuKeys}
 */
export const getExpandKeysFromRouteMath: GetExpandKeysFromRouteMath = memoizeOne((path, flatMenuData) => {
  const openKeys: string[] = [];
  const selectedKeys: string[] = [];

  if (path) {
    const paths = urlToPaths(path.toLowerCase());

    for (const path of paths) {
      for (const menu of flatMenuData) {
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
