import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from 'antd';
import { isFunction } from '/js/utils/utils';
import FlexDrawer, { FlexDrawerProps } from '/js/components/FlexDrawer';

export interface DisplayDrawerProps extends Omit<FlexDrawerProps, 'visible' | 'extra' | 'footer'> {
  onOpen?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  trigger: React.ReactElement;
  extra?: (onClose: () => void) => React.ReactNode;
  footer?: (onClose: () => void) => React.ReactNode;
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
  const [visible, setVisible] = useState(false);

  const onCloseHandler = useCallback(() => {
    setVisible(false);
  }, []);

  const triggerNode = useMemo(() => {
    return React.cloneElement(trigger, {
      onClick(event: React.MouseEvent) {
        const { onClick } = trigger.props;

        onClick && onClick(event);

        setVisible(true);
      }
    });
  }, [trigger]);

  useEffect(() => {
    if (visible) {
      onOpen && onOpen();
    } else {
      onClose && onClose();
    }
  }, [visible]);

  return (
    <>
      {triggerNode}
      <FlexDrawer
        {...restProps}
        visible={visible}
        onClose={onCloseHandler}
        extra={extra(onCloseHandler)}
        footer={isFunction(footer) && footer(onCloseHandler)}
      >
        {children}
      </FlexDrawer>
    </>
  );
});
