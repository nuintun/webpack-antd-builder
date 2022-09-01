/**
 * @module Link
 */

import React, { memo, useCallback, useMemo } from 'react';

import useSyncRef from '/js/hooks/useSyncRef';
import { To, useNavigate, useResolve } from 'react-nest-router';

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type ClickEvent = React.MouseEvent<HTMLAnchorElement, MouseEvent>;

export interface LinkProps<S> extends Omit<AnchorProps, 'href'> {
  href: To;
  state?: S;
  replace?: boolean;
}

function isModifiedEvent(e: ClickEvent) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

function Link<S>(props: LinkProps<S>): React.ReactElement {
  const { href: to, state, replace, children, onClick, ...restProps } = props;

  const resolve = useResolve();
  const navigate = useNavigate();
  const propsRef = useSyncRef(props);
  const href = useMemo(() => resolve(to), [to]);

  const onLinkClick = useCallback((e: ClickEvent) => {
    const { href: to, state, target = '_self', replace, onClick } = propsRef.current;

    if (
      e.button === 0 && // 鼠标左键点击.
      !isModifiedEvent(e) && // 没有组合按键.
      /_self/i.test(target) // 当前窗口打开.
    ) {
      e.preventDefault();

      navigate(to, { state, replace });
    }

    onClick && onClick(e);
  }, []);

  return (
    <a rel="noopener" {...restProps} href={href} onClick={onLinkClick}>
      {children}
    </a>
  );
}

export default memo(Link) as typeof Link;
