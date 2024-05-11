/**
 * @module router
 */

import { resolve } from './url';
import { DFSTree } from './Tree';
import { assert } from './utils';
import { IRoute as NIRoute, Route as NRoute } from 'react-nest-router';

export interface Link {
  readonly href: string;
  readonly target?: React.HTMLAttributeAnchorTarget;
}

export interface Meta {
  readonly icon?: Icon;
  readonly name?: string;
  readonly link?: Partial<Link>;
}

export interface MetaWithKey extends Meta {
  readonly link: Link;
  readonly key: string;
}

export type Icon = string | React.ReactElement;

export type Route<M = unknown, K extends string = string> = NRoute<M & Meta, K>;

export interface IRoute<M = unknown, K extends string = string> extends NIRoute<M, K> {
  readonly meta: M & MetaWithKey;
  readonly children?: NonEmptyArray<IRoute<M, K>>;
}

/**
 * @function parse
 * @description 根据配置文件解析出路由
 * @param router 路由配置
 */
export function parse<M = unknown, K extends string = string>(router: readonly Route<M, K>[]): Route<M, K>[] {
  let uid = 0;

  const routes: Route<M, K>[] = [];

  const getKey = () => (uid++).toString();

  for (const route of router as IRoute<M, K>[]) {
    const key = getKey();
    const { path = '/', meta } = route;
    const { link = { href: path } } = meta || {};
    const mapping: Record<string, Mutable<IRoute<M, K>>> = {};

    const tree = new DFSTree({ ...route, meta: { ...route.meta, key, link } }, ({ meta, children }) => {
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
    });

    // 遍历节点
    for (const [{ meta, children, ...rest }, parent] of tree) {
      // 当前节点数据操作
      const { key, name, link } = meta;
      const hasChildren = children && children.length > 0;

      if (__DEV__) {
        assert(name !== '', `The meta.name of the route item "${link.href}" cannot be an empty string`);
      }

      // 路由处理
      const route = { ...rest, meta } as IRoute<M, K>;
      const parentRoute = parent ? mapping[parent.meta.key] : parent;

      if (hasChildren) {
        mapping[key] = route;
      }

      if (parentRoute) {
        const { children } = parentRoute;

        if (children) {
          children.push(route);
        } else {
          parentRoute.children = [route];
        }
      } else {
        routes.push(route as Route<M, K>);
      }
    }
  }

  return routes;
}
