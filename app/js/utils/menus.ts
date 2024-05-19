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

    const isPreserveSelf = (key: string): boolean => {
      return guards.get(key) !== Filter.PRESERVE_SELF;
    };

    if (execFilter(route) !== Filter.REMOVE_ALL) {
      const tree = new DFSTree(
        route,
        node => {
          return node.children?.filter(node => {
            return execFilter(node) !== Filter.REMOVE_ALL;
          });
        },
        node => {
          const { key } = node.meta;
          const menu = mapping.get(key);

          if (menu) {
            const { children } = menu;
            const isAvailable = node.available === true;

            if (children && children.length > 0) {
              const subset = children.filter(({ key }) => {
                return !removeable.has(key);
              });

              if (subset.length > 0) {
                menu.children = subset;
              } else {
                delete menu.children;

                if (isPreserveSelf(key)) {
                  removeable.add(key);
                }
              }

              menu.children = subset;
            } else if (!isAvailable) {
              if (isPreserveSelf(key)) {
                removeable.add(key);
              }
            }
          }
        }
      );

      // 遍历节点
      for (const [node, parent] of tree) {
        const { meta, children } = node;
        const { key, name, icon, link } = meta;
        const isLayout = children ? children.length > 0 : false;
        const parentMenu = parent ? mapping.get(parent.meta.key) : parent;

        if (!name || guards.get(key) === Filter.REMOVE_SELF) {
          if (isLayout && parentMenu) {
            mapping.set(key, parentMenu);
          }
        } else {
          const menu = transform(icon ? { key, name, link, icon } : { key, name, link }, node);

          if (isLayout) {
            mapping.set(key, menu);
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

  return menus.filter(({ key }) => {
    return !removeable.has(key);
  });
}
