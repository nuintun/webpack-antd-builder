/**
 * @module index
 */

import { Outlet, useMatches, useMatchIndex } from 'react-nest-router';
import React, { createContext, memo, useContext, useEffect, useMemo } from 'react';

interface OnChange {
  (active: boolean): void;
}

export interface KeepAliveProps {
  children: React.ReactNode;
}

const KeepAliveContext = createContext(false);

export function useActiveChange(onChange: OnChange): void {
  const active = useContext(KeepAliveContext);

  useEffect(() => {
    onChange(active);
  }, [active]);
}

export default memo(function KeepAlive({ children }: KeepAliveProps) {
  const matches = useMatches();
  const index = useMatchIndex();

  const { length } = matches;

  const active = useMemo(() => {
    return index + 1 === length;
  }, [index, length]);

  return (
    <KeepAliveContext.Provider value={active}>
      <div hidden={!active}>{children}</div>
      <Outlet />
    </KeepAliveContext.Provider>
  );
});
