/**
 * @module router
 * @description 解析路由配置文件为标准路由，菜单，面包屑数据
 */

import React from 'react';

import { isUndef } from './utils';
import { preorderTrees } from './tree';

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
  hideSubMenu?: boolean;
  children?: Route<T>[];
  component?: React.ComponentType<any>;
  target?: React.HTMLAttributeAnchorTarget;
};

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

export type MenusMap<T> = { [path: string]: MenuItem<T>[] };

export type Breadcrumbs<T> = { [path: string]: BreadcrumbItem<T> };

// See: https://github.com/sindresorhus/is-absolute-url
const IS_ABSOLUTE_REGEX = /^(?:[a-zA-Z][a-zA-Z\d+\-.]*?:|\/)/;

/**
 * @function normalizeURL
 * @param path 路径
 * @param base 来源路径
 */
function normalizeURL(path: string, base?: string): string {
  if (__DEV__ && !path) {
    throw new RangeError(`route path can't be empty`);
  }

  if (!base || IS_ABSOLUTE_REGEX.test(path)) return path;

  const sep = /\/$/.test(base) ? '' : '/';

  return `${base}${sep}${path}`;
}

/**
 * @function parseRouter
 * @description 解析路由配置
 * @param router 路由
 */
export default function parseRouter<T>(router: Route<T>[]): Router<T> {
  const root: string = '';
  const menus: MenuItem<T>[] = [];
  const routes: RouteItem<T>[] = [];
  const breadcrumbs: Breadcrumbs<T> = {};

  // 菜单映射表
  let menusMap: MenusMap<T> = { [root]: [] };

  // 树列表前序深度遍历
  preorderTrees(
    router.map(node => {
      const href = node.href || node.path;

      return { ...node, href };
    }),
    parentNode => {
      const { children } = parentNode;

      if (!isUndef(children)) {
        return children.map(node => {
          const { href: nodeHref } = node;
          const path = normalizeURL(node.path, parentNode.path);
          const href = nodeHref ? normalizeURL(nodeHref, parentNode.href) : path;

          return { ...node, path, href };
        });
      }
    },
    ({ icon, path, href, exact, strict, children, component, sensitive, hideInMenu, hideSubMenu, ...rest }, parentNode) => {
      // 是否为根节点
      const isRootNode = isUndef(parentNode);

      // 当前节点为根节点
      if (isRootNode) {
        // 保存前一个根节点的菜单映射表
        menus.push(...menusMap[root]);

        // 重新初始化菜单映射表
        menusMap = { [root]: [] };
      }

      // 当前节点数据操作
      const key = href.toLowerCase();
      const hasIcon = !isUndef(icon);
      const hasComponent = !isUndef(component);
      const hasChildren = !isUndef(children) && children.length > 0;

      // 处理路由
      if (hasComponent) {
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
      if (hasComponent || hasChildren) {
        const refer = isRootNode ? root : parentNode.path;
        const menu = { key, path, href, ...rest } as MenuItem<T>;

        if (hasIcon) {
          menu.icon = icon;
        }

        if (hasChildren && !hideSubMenu) {
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

      if (hasIcon) {
        breadcrumb.icon = icon;
      }

      if (hasComponent) {
        breadcrumb.href = href;
      }

      breadcrumbs[path] = breadcrumb;
    }
  );

  // 保存最后一个根节点的菜单映射表
  menus.push(...menusMap[root]);

  return { routes, menus, breadcrumbs };
}
