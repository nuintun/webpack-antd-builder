import React, { memo, useCallback, useRef } from 'react';

import useMedia from '/js/hooks/useMedia';
import { isString } from '/js/utils/utils';
import { ConfigProvider, Drawer, DrawerProps } from 'antd';

const containerStyle: React.CSSProperties = { position: 'relative' };

export interface FlexDrawerProps extends DrawerProps {
  children?: React.ReactNode;
}

export default memo(function FlexDrawer({
  children,
  width = 512,
  height = 512,
  ...restProps
}: FlexDrawerProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const isBrokenWidth = useMedia(`(max-width: ${isString(width) ? width : `${width}px`})`);
  const isBrokenHeight = useMedia(`(max-height: ${isString(height) ? height : `${height}px`})`);

  const getPopupContainer = useCallback((triggerNode?: HTMLElement) => {
    const { body } = document;
    const { current } = containerRef;

    return triggerNode === body || current === null ? body : current;
  }, []);

  const getTargetContainer = useCallback(() => containerRef.current || document.body, []);

  return (
    <Drawer {...restProps} width={isBrokenWidth ? '100%' : width} height={isBrokenHeight ? '100%' : height}>
      <div ref={containerRef} style={containerStyle}>
        <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
          {children}
        </ConfigProvider>
      </div>
    </Drawer>
  );
});
