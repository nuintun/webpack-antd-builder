/**
 * @module index
 */

import { GetProp } from 'antd';
import { isFunction } from '/js/utils/utils';
import useLatestRef from '/js/hooks/useLatestRef';
import React, { memo, useCallback, useMemo } from 'react';
import { To, useNavigate, useResolve } from 'react-nest-router';

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export interface LinkProps<S> extends Omit<AnchorProps, 'href'> {
  href: To;
  replace?: boolean;
  state?: S | (() => S);
}

function isModifiedEvent({ altKey, metaKey, ctrlKey, shiftKey }: React.MouseEvent): boolean {
  return !!(altKey || metaKey || ctrlKey || shiftKey);
}

function Link<S>(props: LinkProps<S>) {
  const { href: to, state, replace, children, onClick, ...restProps } = props;

  const resolve = useResolve();
  const navigate = useNavigate();
  const propsRef = useLatestRef(props);
  const href = useMemo(() => resolve(to), [to]);

  const onLinkClick = useCallback<GetProp<AnchorProps, 'onClick'>>(event => {
    const { current: props } = propsRef;
    const { target = '_self', onClick } = props;

    onClick?.(event);

    if (
      event.button === 0 && // 鼠标左键点击.
      /_self/i.test(target) && // 当前窗口打开.
      !isModifiedEvent(event) // 没有组合按键.
    ) {
      event.preventDefault();

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
