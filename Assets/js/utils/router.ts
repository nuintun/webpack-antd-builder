/**
 * @module router
 */

import { resolve } from './url';
import { assert } from './utils';
import { DFSTree } from './tree';
import { IRoute as NIRoute, Route as NRoute } from 'react-nest-router';

export interface Link {
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
}

export interface Meta {
  icon?: Icon;
  name?: string;
  link?: Partial<Link>;
  hideInMenu?: boolean;
  hideInBreadcrumb?: boolean;
}

export interface MetaWithKey extends Meta {
  link: Link;
  key: string;
}

export interface MenuItem {
  key: string;
  icon?: Icon;
  link?: Link;
  name: string;
  children?: MenuItem[];
}

export type Icon = string | React.ReactElement;

export type Route<M = unknown, K extends string = string> = NRoute<M & Meta, K>;

export interface IRoute<M = unknown, K extends string = string> extends Omit<NIRoute<M, K>, 'meta' | 'children'> {
  meta: M & MetaWithKey;
  children?: IRoute<M, K>[];
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
 * @function parse
 * @description 解析配置文件，并返回路由，菜单，面包屑
 * @param router
 */
export function parse<M = unknown, K extends string = string>(
  router: Route<M, K>[]
): [routes: IRoute<M, K>[], menus: MenuItem[]] {
  let uid = 0;

  const menus: MenuItem[] = [];
  const routes: IRoute<M>[] = [];

  const getKey = () => (uid++).toString();

  for (const route of router as IRoute<M, K>[]) {
    const key = getKey();
    const { path = '/', meta } = route;
    const { link = { href: path } } = meta || {};

    const flatMenus: Record<string, MenuItem> = {};
    const flatRoutes: Record<string, IRoute<M, K>> = {};

    const tree = new DFSTree(
      {
        ...route,
        meta: { ...route.meta, key, link }
      },
      ({ meta, children }) => {
        const { href: from } = meta.link;

        if (children) {
          return children.map(route => {
            const key = getKey();
            const { meta } = route;
            const { link } = meta || {};
            const href = resolve(from, link?.href ?? route.path);

            return { ...route, meta: { ...meta, key, link: { ...link, href } } };
          });
        }
      }
    );

    // 遍历节点
    for (const [{ path, meta, sensitive, children, ...rest }, parent] of tree) {
      // 当前节点数据操作
      const hasChildren = children && children.length > 0;
      const { key, name, icon, link, hideInMenu, hideInBreadcrumb } = meta;

      // 格式验证
      if (__DEV__) {
        if (!hideInMenu || !hideInBreadcrumb) {
          assert(name, `Route item "${path}" not hidden in menu or breadcrumb must have a name property.`);
        }
      }

      // 路由处理
      const parentRoute = parent ? flatRoutes[parent.meta.key] : parent;
      const route = { ...rest, meta, sensitive: sensitive === true } as IRoute<M, K>;

      addOptional(route, 'path', path);

      if (hasChildren) {
        flatRoutes[key] = route;
      }

      if (parentRoute) {
        const { children } = parentRoute;

        if (children) {
          children.push(route);
        } else {
          parentRoute.children = [route];
        }
      } else {
        routes.push(route);
      }

      // 菜单处理
      const parentMenu = parent ? flatMenus[parent.meta.key] : parent;

      if (hideInMenu) {
        if (hasChildren && parentMenu) {
          flatMenus[key] = parentMenu;
        }
      } else {
        const menu = { key, name } as MenuItem;

        addOptional(menu, 'icon', icon);
        addOptional(menu, 'link', link);

        if (hasChildren) {
          flatMenus[key] = menu;
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

  return [routes, menus];
}
