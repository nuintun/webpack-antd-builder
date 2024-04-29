/**
 * @module index
 */

import React, { memo } from 'react';
import { Switch, SwitchProps } from 'antd';
import Action, { ActionProps } from '/js/components/Action';

export interface ActionSwitchProps<R>
  extends Omit<ActionProps<R>, 'children' | 'trigger'>,
    Omit<SwitchProps, 'value' | 'loading' | 'onChange'> {}

function ActionSwitch<R>(props: ActionSwitchProps<R>): React.ReactElement {
  const {
    body,
    delay,
    query,
    action,
    notify,
    method,
    onError,
    disabled,
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
      trigger="onChange"
      disabled={disabled}
      onSuccess={onSuccess}
      onComplete={onComplete}
      requestInit={requestInit}
      confirmInit={confirmInit}
      confirmIcon={confirmIcon}
      confirmTitle={confirmTitle}
    >
      <Switch {...restProps} />
    </Action>
  );
}

export default memo(ActionSwitch) as typeof ActionSwitch;
