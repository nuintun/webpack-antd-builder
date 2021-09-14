/**
 * @module getRouter
 * @description 通过初始路由配置获取标准路由，菜单，面包屑数据
 */

import React from 'react';

import isURL from './isURL';

type Key = React.Key;

type Icon = string | React.ReactElement;

export interface Route {
  key?: Key;
  icon?: Icon;
  name: string;
  path: string;
  href?: string;
  exact?: boolean;
  strict?: boolean;
  children?: Route[];
  sensitive?: boolean;
  hideInMenu?: boolean;
  hideInBreadcrumb?: boolean;
  hideChildrenInMenu?: boolean;
  component?: React.ComponentType<any>;
  [key: string]: any;
}

interface RouteNode extends Route {
  href: string;
}

export interface RouteItem {
  key: Key;
  name: string;
  path: string;
  exact: boolean;
  strict: boolean;
  sensitive: boolean;
  component: React.ComponentType<any>;
  [key: string]: any;
}

export interface BreadcrumbItem {
  key: Key;
  icon?: Icon;
  name: string;
  path: string;
  href?: string;
  [key: string]: any;
}

export interface MenuItem {
  key: Key;
  icon?: Icon;
  name: string;
  path: string;
  children?: MenuItem[];
  [key: string]: any;
}

export interface Router {
  menus: MenuItem[];
  routes: RouteItem[];
  breadcrumbs: { [path: string]: BreadcrumbItem };
}

type Callback = (route: RouteNode, referrer?: RouteNode) => void;

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
function walkRouter(route: Route, callback: Callback, referrer?: RouteNode): void {
  const path = normalizeURL(route.path, referrer?.path);
  const href = route.href ? normalizeURL(route.href, referrer?.href) : path;

  const routeNode: RouteNode = { ...route, path, href };

  callback(routeNode, referrer);

  const { children } = route;

  if (children) {
    for (const route of children) {
      walkRouter(route, callback, routeNode);
    }
  }
}

type MenusMap = { [path: string]: MenuItem[] };

type Breadcrumbs = { [path: string]: BreadcrumbItem };

/**
 * @function getRouter
 * @description 获取路由
 * @param router 路由
 */
export default function getRouter(router: Route[]): Router {
  const menus: MenuItem[] = [];
  const routes: RouteItem[] = [];
  const breadcrumbs: Breadcrumbs = {};

  for (const route of router) {
    const root = '';
    const menusMap: MenusMap = { [root]: [] };

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
        });
      }

      if (hasComponent || hasChildren) {
        const refer = referrer ? referrer.path : root;
        const menu: MenuItem = { key, name, path, href, icon, ...rest };

        if (hasChildren && !hideChildrenInMenu) {
          menusMap[path] = menu.children = hideInMenu ? menusMap[refer] : [];
        }

        if (!hideInMenu && menusMap[refer]) {
          menusMap[refer].push(menu);
        }
      }

      if (!hideInBreadcrumb) {
        const breadcrumb: BreadcrumbItem = { key, name, path, icon, ...rest };

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
