/**
 * @module index
 */

import React, { memo } from 'react';

import { Button, ButtonProps } from 'antd';
import Action, { ActionProps } from '/js/components/Action';

export interface ActionButtonProps<R>
  extends Omit<ActionProps<R>, 'children' | 'trigger'>,
    Omit<ButtonProps, 'loading' | 'onClick' | 'onError'> {}

function ActionButton<R>(props: ActionButtonProps<R>): React.ReactElement {
  const {
    body,
    delay,
    query,
    action,
    notify,
    method,
    onError,
    disabled,
    children,
    onSuccess,
    onComplete,
    requestInit,
    confirmIcon,
    confirmInit,
    confirmTitle,
    ...restProps
  } = props;

  return (
    <Action
      body={body}
      delay={delay}
      query={query}
      action={action}
      method={method}
      notify={notify}
      onError={onError}
      disabled={disabled}
      onSuccess={onSuccess}
      onComplete={onComplete}
      requestInit={requestInit}
      confirmInit={confirmInit}
      confirmIcon={confirmIcon}
      confirmTitle={confirmTitle}
    >
      <Button {...restProps}>{children}</Button>
    </Action>
  );
}

export default memo(ActionButton) as typeof ActionButton;
