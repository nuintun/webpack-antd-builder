/**
 * @module Link
 */

import React, { memo, useCallback, useMemo } from 'react';

import { isURL } from '/js/utils/url';
import usePersistRef from '/js/hooks/usePersistRef';
import { useNavigate, useResolve } from 'react-nest-router';

export interface LinkProps<S> extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  state?: S;
  href: string;
  replace?: boolean;
}

function Link<S>(props: LinkProps<S>): React.ReactElement {
  const { href: to, state, replace, children, onClick, ...restProps } = props;

  const resolve = useResolve();
  const navigate = useNavigate();
  const propsRef = usePersistRef(props);
  const isExternal = useMemo(() => isURL(to), [to]);
  const href = useMemo(() => (isExternal ? to : resolve(to)), [to, isExternal]);

  const onLinkClick = useCallback<React.MouseEventHandler<HTMLAnchorElement>>(e => {
    e.preventDefault();

    const { href: to, state, replace, onClick } = propsRef.current;

    onClick && onClick(e);

    navigate(to, { state, replace });
  }, []);

  if (isExternal) {
    return (
      <a {...restProps} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <a {...restProps} href={href} onClick={onLinkClick}>
      {children}
    </a>
  );
}

export default memo(Link) as typeof Link;
