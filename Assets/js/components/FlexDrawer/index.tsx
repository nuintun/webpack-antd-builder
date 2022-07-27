import React, { memo, useCallback, useRef } from 'react';

import useMedia from '/js/hooks/useMedia';
import { isString } from '/js/utils/utils';
import { Drawer, DrawerProps } from 'antd';
import Configure from '/js/components/Configure';

const containerStyle: React.CSSProperties = { position: 'relative' };

export interface FlexDrawerProps extends DrawerProps {
  children?: React.ReactNode;
  breakWidth?: string | number;
  breakHeight?: string | number;
}

export default memo(function FlexDrawer({
  children,
  width = 512,
  height = 512,
  breakWidth = '100vw',
  breakHeight = '100vh',
  ...restProps
}: FlexDrawerProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const isBreakWidth = useMedia(`(max-width: ${isString(width) ? width : `${width}px`})`);
  const isBreakHeight = useMedia(`(max-height: ${isString(height) ? height : `${height}px`})`);

  const getPopupContainer = useCallback((triggerNode?: HTMLElement) => {
    const { body } = document;
    const { current } = containerRef;

    return triggerNode === body || current === null ? body : current;
  }, []);

  const getTargetContainer = useCallback(() => containerRef.current || document.body, []);

  return (
    <Drawer {...restProps} width={isBreakWidth ? breakWidth : width} height={isBreakHeight ? breakHeight : height}>
      <div ref={containerRef} style={containerStyle}>
        <Configure getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
          {children}
        </Configure>
      </div>
    </Drawer>
  );
});
