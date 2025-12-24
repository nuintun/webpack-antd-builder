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
  | 'color'
  | 'ghost'
  | 'shape'
  | 'style'
  | 'title'
  | 'danger'
  | 'variant'
  | 'children'
  | 'tabIndex'
  | 'autoFocus'
  | 'className'
  | 'iconPlacement'
  | 'autoInsertSpace';

export interface ActionButtonProps<R>
  extends ActionProps<null, R>, Pick<ButtonProps, ButtonPicked>, Pick<RequestOptions<R>, 'query' | 'method' | 'notify'> {
  action: string;
  bubbles?: boolean;
}

function ActionButton<R>({
  id,
  icon,
  size,
  type,
  block,
  color,
  ghost,
  shape,
  style,
  title,
  action,
  danger,
  bubbles,
  variant,
  children,
  tabIndex,
  autoFocus,
  className,
  iconPlacement,
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
      color={color}
      ghost={ghost}
      shape={shape}
      style={style}
      title={title}
      danger={danger}
      loading={loading}
      onClick={onClick}
      variant={variant}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      className={className}
      disabled={restProps.disabled}
      iconPlacement={iconPlacement}
      autoInsertSpace={autoInsertSpace}
    >
      {children}
    </Button>
  );
}

export default memo(ActionButton) as typeof ActionButton;
