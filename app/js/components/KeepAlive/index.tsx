/**
 * @module index
 */

import { Outlet, useMatches, useMatchIndex } from 'react-nest-router';
import React, { Activity, createContext, memo, use, useEffect, useMemo } from 'react';

interface OnChange {
  (active: boolean): void;
}

export interface KeepAliveProps {
  children: React.ReactNode;
}

const KeepAliveContext = createContext(false);

export function useActiveChange(onChange: OnChange): void {
  const active = use(KeepAliveContext);

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
    <>
      <KeepAliveContext value={active}>
        <Activity mode={active ? 'visible' : 'hidden'}>{children}</Activity>
      </KeepAliveContext>
      <Outlet />
    </>
  );
});
