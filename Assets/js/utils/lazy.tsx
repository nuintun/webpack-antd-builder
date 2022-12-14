/**
 * @module lazy
 */

import React, { lazy as lazyImpl } from 'react';

export interface Factory<P = unknown> {
  (): Promise<{ default: React.ComponentType<P> }>;
}

/**
 * @function lazy
 * @description 异步按需加载组件
 * @param factory 加载函数
 * @param props 组件参数
 */
export default function lazy<P = unknown>(factory: Factory<P>, props?: P): React.ReactElement {
  const Component: React.ComponentType<any> = lazyImpl(factory);

  return props ? <Component {...props} /> : <Component />;
}
