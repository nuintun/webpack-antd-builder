/**
 * @module index
 */

import React, { cloneElement, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from 'antd';
import FlexDrawer, { FlexDrawerProps } from '/js/components/FlexDrawer';

export interface DisplayDrawerProps extends Omit<FlexDrawerProps, 'open' | 'extra' | 'footer'> {
  onOpen?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  extra?: (onClose: () => void) => React.ReactNode;
  footer?: (onClose: () => void) => React.ReactNode;
  trigger: React.ReactElement<{ onClick?: (...args: unknown[]) => void }>;
}

function defaultExtra(onClose: () => void): React.ReactNode {
  return (
    <Button htmlType="reset" onClick={onClose}>
      取消
    </Button>
  );
}

export default memo(function DisplayDrawer({
  footer,
  onOpen,
  trigger,
  onClose,
  children,
  extra = defaultExtra,
  ...restProps
}: DisplayDrawerProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  const onCloseHandler = useCallback(() => {
    setOpen(false);
  }, []);

  const triggerNode = useMemo(() => {
    return cloneElement(trigger, {
      onClick(...args: unknown[]) {
        const { onClick } = trigger.props;

        setOpen(true);

        onClick?.(...args);
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
