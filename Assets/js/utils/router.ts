/**
 * @module router
 */

import { DFSTree } from './tree';
import { resolve, Resolver } from './path';

type Icon = string | React.ReactElement;

export type Route<T> = T & {
  icon?: Icon;
  name: string;
  path: string;
  href?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  hideInMenu?: boolean;
  hideSubMenu?: boolean;
  children?: Route<T>[];
  component?: React.ComponentType<any>;
  target?: React.HTMLAttributeAnchorTarget;
};

export type RouteItem<T> = T & {
  key: string;
  name: string;
  path: string;
  exact: boolean;
  strict: boolean;
  sensitive: boolean;
  component: React.ComponentType<any>;
};

export type MenuItem<T> = T & {
  key: string;
  icon?: Icon;
  name: string;
  path: string;
  href: string;
  children?: MenuItem<T>[];
  target?: React.HTMLAttributeAnchorTarget;
};

export type BreadcrumbItem<T> = T & {
  key: string;
  icon?: Icon;
  name: string;
  path: string;
  href?: string;
  parent?: BreadcrumbItem<T>;
};

export type MenusMap<T> = { [path: string]: MenuItem<T>[] };

export type Breadcrumbs<T> = { [path: string]: BreadcrumbItem<T> };

/**
 * @function parse
 * @description 解析配置文件，并返回路由，菜单，面包屑
 * @param router
 */
export function parse<T>(
  router: Route<T>[]
): [routes: RouteItem<T>[], menus: MenuItem<T>[], breadcrumbs: { [path: string]: BreadcrumbItem<T> }] {
  let uid = 0;

  const root: string = '';
  const menus: MenuItem<T>[] = [];
  const routes: RouteItem<T>[] = [];
  const breadcrumbs: Breadcrumbs<T> = {};
  const resolveRoute: Resolver = path => ['', path, ''];

  for (const route of router) {
    const menusMap: MenusMap<T> = { [root]: [] };
    const tree = new DFSTree({ ...route, href: route.href || route.path }, parent => {
      const { children } = parent;

      if (children) {
        return children.map(route => {
          const { href: routeHref } = route;
          const path = resolve(parent.path, route.path, resolveRoute);
          const href = routeHref ? resolve(parent.href, routeHref) : path;

          return { ...route, path, href };
        });
      }
    });

    for (const [
      { icon, path, href, exact, strict, children, component, sensitive, hideInMenu, hideSubMenu, ...rest },
      parent
    ] of tree) {
      // 当前节点数据操作
      const key = (uid++).toString();
      const hasSubRoutes = children && children.length > 0;

      // 处理路由
      if (component) {
        routes.push({
          key,
          path,
          component,
          exact: exact !== false,
          strict: strict !== false,
          sensitive: sensitive === true,
          ...rest
        } as RouteItem<T>);
      }

      // 处理菜单
      if (hasSubRoutes || component) {
        const refer = parent ? parent.path : root;
        const menu = { key, path, href, ...rest } as MenuItem<T>;

        if (icon) {
          menu.icon = icon;
        }

        if (hasSubRoutes && !hideSubMenu) {
          menusMap[path] = menu.children = hideInMenu ? menusMap[refer] : [];
        }

        if (!hideInMenu) {
          const parentNodeChildren = menusMap[refer];

          if (parentNodeChildren) {
            parentNodeChildren.push(menu);
          }
        }
      }

      // 处理面包屑
      const breadcrumb = { key, path, ...rest } as BreadcrumbItem<T>;

      if (icon) {
        breadcrumb.icon = icon;
      }

      if (component) {
        breadcrumb.href = href;
      }

      if (parent) {
        breadcrumb.parent = breadcrumbs[parent.path];
      }

      breadcrumbs[path] = breadcrumb;
    }

    menus.push(...menusMap[root]);
  }

  return [routes, menus, breadcrumbs];
}
