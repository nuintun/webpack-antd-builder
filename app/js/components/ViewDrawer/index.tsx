/**
 * @module index
 */

import { Button } from 'antd';
import FlexDrawer, { FlexDrawerProps } from '/js/components/FlexDrawer';
import React, { cloneElement, memo, useCallback, useEffect, useMemo, useState } from 'react';

export interface ViewDrawerProps extends Omit<FlexDrawerProps, 'open' | 'extra' | 'footer'> {
  onOpen?: () => void;
  onClose?: () => void;
  trigger: React.ReactElement<{
    disabled?: boolean;
    onClick?: (...args: unknown[]) => void;
  }>;
  extra?: (onClose: () => void) => React.ReactNode;
  footer?: (onClose: () => void) => React.ReactNode;
}

function defaultExtra(onClose: () => void): React.ReactNode {
  return <Button onClick={onClose}>取消</Button>;
}

export default memo(function ViewDrawer({
  footer,
  onOpen,
  trigger,
  onClose,
  children,
  extra = defaultExtra,
  ...restProps
}: ViewDrawerProps) {
  const [open, setOpen] = useState(false);

  const onCloseHandler = useCallback(() => {
    setOpen(false);
  }, []);

  const triggerNode = useMemo(() => {
    return cloneElement(trigger, {
      onClick(...args: unknown[]) {
        const { disabled, onClick } = trigger.props;

        if (!disabled) {
          setOpen(true);

          onClick?.(...args);
        }
      }
    });
  }, [trigger]);

  useEffect(() => {
    if (open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [open]);

  return (
    <>
      {triggerNode}
      <FlexDrawer
        {...restProps}
        open={open}
        onClose={onCloseHandler}
        extra={extra(onCloseHandler)}
        footer={footer?.(onCloseHandler)}
      >
        {children}
      </FlexDrawer>
    </>
  );
});
