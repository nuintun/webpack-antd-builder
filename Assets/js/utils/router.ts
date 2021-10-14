/**
 * @module router
 * @description 解析路由配置文件为标准路由，菜单，面包屑数据
 */

import React from 'react';

import isURL from './isURL';

type Key = React.Key;

type Icon = string | React.ReactElement;

export type Route<T> = T & {
  key?: Key;
  icon?: Icon;
  name: string;
  path: string;
  href?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  hideInMenu?: boolean;
  children?: Route<T>[];
  hideInBreadcrumb?: boolean;
  hideChildrenInMenu?: boolean;
  component?: React.ComponentType<any>;
  target?: React.HTMLAttributeAnchorTarget;
};

type RouteNode<T> = Route<T> & { href: string };

export type RouteItem<T> = T & {
  key: Key;
  name: string;
  path: string;
  exact: boolean;
  strict: boolean;
  sensitive: boolean;
  component: React.ComponentType<any>;
};

export type MenuItem<T> = T & {
  key: Key;
  icon?: Icon;
  name: string;
  path: string;
  href: string;
  children?: MenuItem<T>[];
  target?: React.HTMLAttributeAnchorTarget;
};

export type BreadcrumbItem<T> = T & {
  key: Key;
  icon?: Icon;
  name: string;
  path: string;
  href?: string;
};

export interface Router<T> {
  menus: MenuItem<T>[];
  routes: RouteItem<T>[];
  breadcrumbs: { [path: string]: BreadcrumbItem<T> };
}

type Callback<T> = (route: RouteNode<T>, referrer?: RouteNode<T>) => void;

/**
 * @function isAbsolute
 * @param path 路径
 */
function isAbsolute(path: string): boolean {
  return /^\//.test(path) || isURL(path);
}

/**
 * @function normalizeURL
 * @param path 路径
 * @param base 来源路径
 */
function normalizeURL(path: string, base?: string): string {
  if (__DEV__ && !path) {
    throw new RangeError(`route path can't be empty`);
  }

  if (!base || isAbsolute(path)) return path;

  const sep = /\/$/.test(base) ? '' : '/';

  return `${base}${sep}${path}`;
}

/**
 * @function walkRouter
 * @param route 路由
 * @param callback 回调
 * @param referrer 来源路由
 */
function walkRouter<T>(route: Route<T>, callback: Callback<T>, referrer?: RouteNode<T>): void {
  const path = normalizeURL(route.path, referrer?.path);
  const href = route.href ? normalizeURL(route.href, referrer?.href) : path;

  const routeNode: RouteNode<T> = { ...route, path, href };

  callback(routeNode, referrer);

  const { children } = route;

  if (children) {
    for (const route of children) {
      walkRouter(route, callback, routeNode);
    }
  }
}

type MenusMap<T> = { [path: string]: MenuItem<T>[] };

type Breadcrumbs<T> = { [path: string]: BreadcrumbItem<T> };

/**
 * @function parse
 * @description 解析路由配置
 * @param router 路由
 */
export default function parse<T>(router: Route<T>[]): Router<T> {
  const menus: MenuItem<T>[] = [];
  const routes: RouteItem<T>[] = [];
  const breadcrumbs: Breadcrumbs<T> = {};

  for (const route of router) {
    const root = '';
    const menusMap: MenusMap<T> = { [root]: [] };

    walkRouter(route, (route, referrer) => {
      const {
        name,
        icon,
        path,
        href,
        exact,
        strict,
        children,
        component,
        sensitive,
        hideInMenu,
        hideInBreadcrumb,
        hideChildrenInMenu,
        ...rest
      } = route;
      const key = href.toLowerCase();
      const hasComponent = !!component;
      const hasChildren = !!children?.length;

      if (component) {
        routes.push({
          key,
          name,
          path,
          component,
          exact: exact !== false,
          strict: strict !== false,
          sensitive: sensitive === true,
          ...rest
        } as RouteItem<T>);
      }

      if (hasComponent || hasChildren) {
        const refer = referrer ? referrer.path : root;
        const menu = { key, name, path, href, icon, ...rest } as MenuItem<T>;

        if (hasChildren && !hideChildrenInMenu) {
          menusMap[path] = menu.children = hideInMenu ? menusMap[refer] : [];
        }

        if (!hideInMenu && menusMap[refer]) {
          menusMap[refer].push(menu);
        }
      }

      if (!hideInBreadcrumb) {
        const breadcrumb = { key, name, path, icon, ...rest } as BreadcrumbItem<T>;

        if (hasComponent) {
          breadcrumb.href = href;
        }

        breadcrumbs[path] = breadcrumb;
      }
    });

    menus.push(...menusMap[root]);
  }

  return { routes, menus, breadcrumbs };
}
