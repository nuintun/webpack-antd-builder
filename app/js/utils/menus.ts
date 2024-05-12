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
 * @function isIgnored
 * @description 检查节点是否为忽略状态
 * @param state 节点过滤状态
 */
function isIgnored(state?: Filter): boolean {
  return state === Filter.REMOVE_ALL || state === Filter.REMOVE_SELF;
}

/**
 * @function parse
 * @description 根据路由解析出菜单
 * @param routes 路由
 * @param filter 过滤器
 */
export function nparse<M = unknown>(
  routes: readonly Route<M>[],
  filter: (route: IRoute<M>) => Filter = () => Filter.DEFAULT,
  transform: (menu: MenuItem, route: IRoute<M>) => MenuItem = menu => menu
): MenuItem[] {
  const menus: MenuItem[] = [];

  for (const route of routes) {
    const removeable = new Set<string>();
    const guards = new Map<string, Filter>();
    const tree = new DFSTree(route as IRoute<M>, node => {
      const guard = filter(node);

      guards.set(node.meta.key, guard);

      if (guard !== Filter.REMOVE_ALL) {
        return node.children;
      }
    });
    const mapping: Map<string, [parentKey: string | null, menu: MenuItem]> = new Map();

    // 遍历节点
    for (const [node, parent] of tree) {
      // 当前节点数据
      const { meta, children } = node;
      const { key, name, icon, link } = meta;

      // 当前节点计算属性
      const guard = guards.get(key);
      const hasChildren = children ? children.length > 0 : false;

      if (name && hasChildren && guard !== Filter.PRESERVE_SELF) {
        removeable.add(key);
      }

      if (!name || isIgnored(guard)) {
        if (parent && hasChildren) {
          const value = mapping.get(parent.meta.key);

          if (value && guard === Filter.REMOVE_SELF) {
            mapping.set(key, value);
          }
        }
      } else {
        const parentKey = parent ? parent.meta.key : null;

        if (parentKey) {
          removeable.delete(parentKey);
        }

        if (icon == null) {
          mapping.set(key, [parentKey, transform({ key, name, link }, node)]);
        } else {
          mapping.set(key, [parentKey, transform({ key, name, link, icon }, node)]);
        }
      }
    }

    console.group('菜单转换过滤');

    console.log('可删除菜单', removeable);
    console.log('映射菜单数', mapping.size);

    for (const [key, [parentKey, menu]] of mapping) {
      if (!removeable.has(key)) {
        console.log(key !== menu.key ? '中转节点' : '菜单节点', key, parentKey, menu);
      }
    }

    console.groupEnd();
  }

  return menus;
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

      return item.children.length > 0;
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

  for (const route of routes) {
    const guards = new Map<string, Filter>();
    const mapping = new Map<string, MenuItem>();

    const tree = new DFSTree(route as IRoute<M>, node => {
      const guard = filter(node);

      guards.set(node.meta.key, guard);

      if (guard !== Filter.REMOVE_ALL) {
        return node.children;
      }
    });

    // 遍历节点
    for (const [node, parent] of tree) {
      // 当前节点数据
      const { meta, children } = node;
      const { key, name, icon, link } = meta;

      // 当前节点计算属性
      const guard = guards.get(key);
      const hasChildren = children ? children.length > 0 : false;
      const parentMenu = parent ? mapping.get(parent.meta.key) : null;

      if (!name || isIgnored(guard)) {
        if (hasChildren && parentMenu && guard === Filter.REMOVE_SELF) {
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

  return removeEmptyLayouts(menus, removeable);
}
