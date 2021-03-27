import { createContext, useContext } from 'react';

export default function createAuthorization<A, T>(
  interceptor: (authority: A, type: T) => boolean
): [useAuthorized: (type: T) => boolean, Provider: React.Provider<A>] {
  const context = createContext((null as unknown) as A);

  const useAuthorized = (type: T): boolean => {
    const authority = useContext(context);

    return interceptor(authority, type);
  };

  return [useAuthorized, context.Provider];
}
