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
function isIgnored(state: Filter): boolean {
  return state === Filter.REMOVE_ALL || state === Filter.REMOVE_SELF;
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
  const guards: Record<string, Filter> = {};
  const removeable: Set<string> = new Set();

  for (const route of routes) {
    const mapping: Record<string, MenuItem> = {};

    const tree = new DFSTree(route as IRoute<M>, node => {
      const guard = filter(node);

      guards[node.meta.key] = guard;

      if (guard !== Filter.REMOVE_ALL) {
        return node.children;
      }
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

          if (guards[key] !== Filter.PRESERVE_SELF) {
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
