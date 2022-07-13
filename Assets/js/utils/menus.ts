/**
 * @module menus
 */

import { DFSTree } from './tree';
import { Icon, IRoute, Link, Route } from './router';

export enum Filter {
  All = 0,
  Self = 1,
  None = 2
}

export interface MenuItem {
  key: string;
  link?: Link;
  icon?: Icon;
  name: string;
  children?: MenuItem[];
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
export function parse<M = unknown>(routes: Route<M>[], filter: (route: IRoute<M>) => Filter = () => Filter.None): MenuItem[] {
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

      if (!name || guards[key] !== Filter.None) {
        if (hasChildren && parentMenu) {
          mapping[key] = parentMenu;
        }
      } else {
        const menu: MenuItem = { key, name, link };

        addOptional(menu, 'icon', icon);

        if (hasChildren) {
          layouts[key] = true;
          mapping[key] = menu;
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
