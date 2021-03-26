import { createContext, useContext } from 'react';

export type Interceptor = <A, T>(authority: A, type: T) => boolean;

export default function createAuthorization<A, T>(
  interceptor: Interceptor
): [useAuthorized: (type: T) => boolean, Provider: React.Provider<A>] {
  const context = createContext((null as unknown) as A);

  const useAuthorized = (type: T) => {
    const authority = useContext(context);

    return interceptor(authority, type);
  };

  return [useAuthorized, context.Provider];
}
