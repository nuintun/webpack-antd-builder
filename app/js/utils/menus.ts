/**
 * @module menus
 */

import { DFSTree } from './Tree';
import { Icon, IRoute, Link, Route } from './router';

export interface MenuItem {
  key: string;
  link?: Link;
  icon?: Icon;
  name: string;
  children?: MenuItem[];
}

export const enum Filter {
  /**
   * @description 过滤无子节点的节点
   */
  DEFAULT,
  /**
   * @description 过滤当自身点和子节点
   */
  REMOVE_ALL,
  /**
   * @description 仅过滤自身节点，子节点正常处理
   */
  REMOVE_SELF,
  /**
   * @description 强制保留自身节点，子节点正常处理
   */
  PRESERVE_SELF
}

/**
 * @function removeEmptyLayouts
 * @description 过滤只有布局的菜单
 * @param items 菜单配置
 * @param removeable 可以进行删除的布局菜单
 */
function removeEmptyLayouts(items: MenuItem[], removeable: Set<string>): MenuItem[] {
  return items.filter(item => {
    const { children } = item;

    if (children && children.length > 0) {
      item.children = removeEmptyLayouts(children, removeable);

      if (item.children.length > 0) {
        return true;
      }
    }

    return !removeable.has(item.key);
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
  filter: (route: IRoute<M>) => Filter = () => Filter.DEFAULT,
  transform: (menu: MenuItem, route: IRoute<M>) => MenuItem = menu => menu
): MenuItem[] {
  const menus: MenuItem[] = [];
  const removeable = new Set<string>();

  for (const route of routes as IRoute<M>[]) {
    const guards = new Map<string, Filter>();
    const mapping = new Map<string, MenuItem>();

    const execFilter = (node: IRoute<M>): Filter => {
      const guard = filter(node);

      guards.set(node.meta.key, guard);

      return guard;
    };

    if (execFilter(route) !== Filter.REMOVE_ALL) {
      const tree = new DFSTree(route, node => {
        return node.children?.filter(node => {
          return execFilter(node) !== Filter.REMOVE_ALL;
        });
      });

      // 遍历节点
      for (const [node, parent] of tree) {
        // 节点数据
        const { meta, children } = node;
        const { key, name, icon, link } = meta;

        // 计算属性
        const guard = guards.get(key);
        const hasChildren = children ? children.length > 0 : false;
        const parentMenu = parent ? mapping.get(parent.meta.key) : null;

        if (!name || guard === Filter.REMOVE_SELF) {
          if (hasChildren && parentMenu) {
            mapping.set(key, parentMenu);
          }
        } else {
          const menu = transform(icon ? { key, name, link, icon } : { key, name, link }, node);

          if (hasChildren) {
            mapping.set(key, menu);

            if (guard !== Filter.PRESERVE_SELF) {
              removeable.add(key);
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
  }

  return removeEmptyLayouts(menus, removeable);
}
