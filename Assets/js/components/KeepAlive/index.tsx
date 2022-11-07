import { createContext, memo, useContext, useEffect, useMemo } from 'react';

import { createPortal } from 'react-dom';
import { Outlet, useMatches, useMatchIndex } from 'react-nest-router';

export interface KeepAliveProps {
  target: React.ReactNode;
  getOutletRoot?: () => HTMLElement;
}

const context = createContext(false);

const { Provider } = context;

export function useActiveChange(onChange: (active: boolean) => void): void {
  const active = useContext(context);

  useEffect(() => {
    onChange(active);
  }, [active]);
}

export default memo(function KeepAlive({ target, getOutletRoot }: KeepAliveProps): React.ReactElement {
  const matches = useMatches();
  const index = useMatchIndex();

  const { length } = matches;

  const active = useMemo(() => {
    return index + 1 === length;
  }, [index, length]);

  const outlet = useMemo(() => {
    const root = getOutletRoot?.();

    return root ? createPortal(<Outlet />, root) : <Outlet />;
  }, [getOutletRoot]);

  return (
    <Provider value={active}>
      <div hidden={!active}>{target}</div>
      {outlet}
    </Provider>
  );
});
