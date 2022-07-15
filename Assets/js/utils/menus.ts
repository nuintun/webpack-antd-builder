/**
 * @module menus
 */

import { DFSTree } from './tree';
import { Icon, IRoute, Link, Route } from './router';

export interface MenuItem {
  key: string;
  link?: Link;
  icon?: Icon;
  name: string;
  children?: MenuItem[];
}

export const enum Filter {
  All = 0, // 过滤当前节点和子节点
  Self = 1, // 仅过滤当前节点，子节点正常处理
  Keep = 2, // 强制保留当前节点，子节点正常处理
  None = 3 // 缺省模式，若当前节点为布局节点且无子节点，将会被过滤
}

/**
 * @function isIgnored
 * @description 检查节点是否为忽略状态
 * @param state 节点过滤状态
 */
function isIgnored(state: Filter): boolean {
  return state === Filter.All || state === Filter.Self;
}

/**
 * @function addOptional
 * @description 添加可选属性
 * @param source 源对象
 * @param key 属性名
 * @param value 属性值
 */
function addOptional<T>(source: T, key: keyof T, value: T[typeof key]): void {
  if (value !== undefined) {
    source[key] = value;
  }
}

/**
 * @function removeOnlyLayoutMenus
 * @description 过滤只有布局的菜单
 * @param items 菜单配置
 * @param layouts 布局路由对应菜单映射
 */
function removeOnlyLayoutMenus(items: MenuItem[], layouts: Record<string, boolean>): MenuItem[] {
  return items.filter(item => {
    const { children } = item;

    if (children && children.length > 0) {
      item.children = removeOnlyLayoutMenus(children, layouts);

      return item.children.length > 0;
    }

    return !layouts[item.key];
  });
}

/**
 * @function parse
 * @description 根据路由解析出菜单
 * @param routes 路由
 * @param filter 过滤器
 */
export function parse<M = unknown>(
  routes: readonly Route<M>[],
  filter: (route: IRoute<M>) => Filter = () => Filter.None,
  transform: (menu: MenuItem, route: IRoute<M>) => MenuItem = menu => menu
): MenuItem[] {
  const menus: MenuItem[] = [];
  const guards: Record<string, Filter> = {};
  const layouts: Record<string, boolean> = {};

  for (const route of routes) {
    const mapping: Record<string, MenuItem> = {};

    const tree = new DFSTree(route as IRoute<M>, node => {
      const guard = filter(node);

      guards[node.meta.key] = guard;

      if (guard !== Filter.All) return node.children;
    });

    // 遍历节点
    for (const [node, parent] of tree) {
      // 当前节点数据操作
      const { meta, children } = node;
      const { key, name, icon, link } = meta;
      const hasChildren = children && children.length > 0;
      const parentMenu = parent ? mapping[parent.meta.key] : parent;

      if (!name || isIgnored(guards[key])) {
        if (hasChildren && parentMenu) {
          mapping[key] = parentMenu;
        }
      } else {
        let menu: MenuItem = { key, name, link };

        addOptional(menu, 'icon', icon);

        menu = transform(menu, node);

        if (hasChildren) {
          mapping[key] = menu;

          if (guards[key] !== Filter.Keep) {
            layouts[key] = true;
          }
        }

        if (parentMenu) {
          const { children } = parentMenu;

          if (children) {
            children.push(menu);
          } else {
            parentMenu.children = [menu];
          }
        } else {
          menus.push(menu);
        }
      }
    }
  }

  return removeOnlyLayoutMenus(menus, layouts);
}
