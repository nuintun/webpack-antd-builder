/**
 * @module createAuthorization
 */

import React, { createContext, useContext } from 'react';

/**
 * @function createAuthorization
 * @description 【Hook】权限验证
 * @param interceptor 权限验证拦截器
 */
export default function createAuthorization<A, T>(
  interceptor: (authority: A, type: T) => boolean
): [useAuthorized: (type: T) => boolean, AuthorizationProvider: React.Provider<A>] {
  const context = createContext((null as unknown) as A);

  const useAuthorized = (type: T): boolean => {
    const authority = useContext(context);

    return interceptor(authority, type);
  };

  return [useAuthorized, context.Provider];
}
