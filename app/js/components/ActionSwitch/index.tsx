/**
 * @module index
 */

import React, { memo, useCallback } from 'react';
import { GetProp, Switch, SwitchProps } from 'antd';
import { RequestOptions } from '/js/hooks/useRequest';
import useAction, { Options as ActionProps } from '/js/hooks/useAction';

type SwitchPicked =
  | 'id'
  | 'size'
  | 'style'
  | 'checked'
  | 'onChange'
  | 'tabIndex'
  | 'autoFocus'
  | 'className'
  | 'checkedChildren'
  | 'unCheckedChildren';

export interface ActionSwitchProps<R>
  extends ActionProps<Record<string, boolean> | null, R>,
    Pick<SwitchProps, SwitchPicked>,
    Pick<RequestOptions<R>, 'query' | 'method' | 'notify'> {
  name?: string;
  action: string;
  bubbles?: boolean;
}

function ActionSwitch<R>({
  id,
  name,
  size,
  style,
  action,
  bubbles,
  checked,
  onChange,
  tabIndex,
  autoFocus,
  className,
  checkedChildren,
  unCheckedChildren,
  ...restProps
}: ActionSwitchProps<R>): React.ReactElement {
  const [loading, onAction, render] = useAction(action, restProps);

  const onClick = useCallback<GetProp<SwitchProps, 'onClick'>>(
    (_checked, event) => {
      if (bubbles === false) {
        event.stopPropagation();
      }
    },
    [bubbles]
  );

  const onSwitchChange = useCallback<GetProp<SwitchProps, 'onChange'>>(
    (checked, event) => {
      if (name) {
        onAction({ [name]: checked });
      } else {
        onAction(null);
      }

      onChange?.(checked, event);
    },
    [name]
  );

  return render(
    <Switch
      id={id}
      size={size}
      style={style}
      checked={checked}
      onClick={onClick}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      className={className}
      onChange={onSwitchChange}
      disabled={restProps.disabled}
      checkedChildren={checkedChildren}
      unCheckedChildren={unCheckedChildren}
      loading={restProps.confirm ? false : loading}
    />
  );
}

export default memo(ActionSwitch) as typeof ActionSwitch;
