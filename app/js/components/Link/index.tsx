/**
 * @module index
 */

import { isFunction } from '/js/utils/utils';
import useLatestRef from '/js/hooks/useLatestRef';
import React, { memo, useCallback, useMemo } from 'react';
import { To, useNavigate, useResolve } from 'react-nest-router';

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type ClickEvent = React.MouseEvent<HTMLAnchorElement, MouseEvent>;

export interface LinkProps<S> extends Omit<AnchorProps, 'href'> {
  href: To;
  replace?: boolean;
  state?: S | (() => S);
}

function isModifiedEvent(e: ClickEvent) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

function Link<S>(props: LinkProps<S>): React.ReactElement {
  const { href: to, state, replace, children, onClick, ...restProps } = props;

  const resolve = useResolve();
  const navigate = useNavigate();
  const propsRef = useLatestRef(props);
  const href = useMemo(() => resolve(to), [to]);

  const onLinkClick = useCallback((e: ClickEvent) => {
    const { current: props } = propsRef;
    const { target = '_self', onClick } = props;

    onClick?.(e);

    if (
      e.button === 0 && // 鼠标左键点击.
      !isModifiedEvent(e) && // 没有组合按键.
      /_self/i.test(target) // 当前窗口打开.
    ) {
      e.preventDefault();

      const { href: to, state, replace } = props;

      navigate(to, { replace, state: isFunction(state) ? state() : state });
    }
  }, []);

  return (
    <a rel="noopener" {...restProps} href={href} onClick={onLinkClick}>
      {children}
    </a>
  );
}

export default memo(Link) as typeof Link;
