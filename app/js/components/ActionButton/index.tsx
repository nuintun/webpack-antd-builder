/**
 * @module index
 */

import React, { memo, useCallback } from 'react';
import { Button, ButtonProps, GetProp } from 'antd';
import { RequestOptions } from '/js/hooks/useRequest';
import useAction, { Options as ActionProps } from '/js/hooks/useAction';

type ButtonPicked =
  | 'id'
  | 'icon'
  | 'size'
  | 'type'
  | 'block'
  | 'ghost'
  | 'shape'
  | 'style'
  | 'title'
  | 'danger'
  | 'children'
  | 'tabIndex'
  | 'autoFocus'
  | 'className'
  | 'iconPosition'
  | 'autoInsertSpace';

export interface ActionButtonProps<R>
  extends ActionProps<null, R>,
    Pick<ButtonProps, ButtonPicked>,
    Pick<RequestOptions<R>, 'query' | 'method' | 'notify'> {
  action: string;
  bubbles?: boolean;
}

function ActionButton<R>({
  id,
  icon,
  size,
  type,
  block,
  ghost,
  shape,
  style,
  title,
  action,
  danger,
  bubbles,
  children,
  tabIndex,
  autoFocus,
  className,
  iconPosition,
  autoInsertSpace,
  ...restProps
}: ActionButtonProps<R>): React.ReactElement {
  const [loading, onAction, render] = useAction(action, restProps);

  const onClick = useCallback<GetProp<ButtonProps, 'onClick'>>(
    event => {
      if (bubbles === false) {
        event.stopPropagation();
      }

      onAction(null);
    },
    [bubbles]
  );

  return render(
    <Button
      id={id}
      icon={icon}
      size={size}
      type={type}
      block={block}
      ghost={ghost}
      shape={shape}
      style={style}
      title={title}
      danger={danger}
      onClick={onClick}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      className={className}
      iconPosition={iconPosition}
      disabled={restProps.disabled}
      autoInsertSpace={autoInsertSpace}
      loading={restProps.confirm ? false : loading}
    >
      {children}
    </Button>
  );
}

export default memo(ActionButton) as typeof ActionButton;
