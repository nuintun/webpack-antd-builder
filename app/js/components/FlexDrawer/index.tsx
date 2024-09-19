/**
 * @module index
 */

import { isString } from '/js/utils/utils';
import useMediaQuery from '/js/hooks/useMediaQuery';
import React, { memo, useCallback, useRef } from 'react';
import { ConfigProvider, Drawer, DrawerProps, GetProp } from 'antd';

export interface FlexDrawerProps extends DrawerProps {
  breakWidth?: string | number;
  breakHeight?: string | number;
}

const containerStyle: React.CSSProperties = {
  minWidth: 'fit-content'
};

const drawerStyles: GetProp<DrawerProps, 'styles'> = {
  body: {
    outline: 'none',
    position: 'relative'
  }
};

export default memo(function FlexDrawer({
  children,
  height = 720,
  width = 1440,
  closeIcon = false,
  breakWidth = '100vw',
  breakHeight = '100vh',
  styles = drawerStyles,
  ...restProps
}: FlexDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isBreakWidth = useMediaQuery(`(max-width: ${isString(width) ? width : `${width}px`})`);
  const isBreakHeight = useMediaQuery(`(max-height: ${isString(height) ? height : `${height}px`})`);

  const getPopupContainer = useCallback((triggerNode?: HTMLElement) => {
    const { body } = document;
    const { current } = containerRef;

    return triggerNode === body || current === null ? body : current;
  }, []);

  const getTargetContainer = useCallback(() => containerRef.current || document.body, []);

  return (
    <Drawer
      {...restProps}
      styles={styles}
      closeIcon={closeIcon}
      width={isBreakWidth ? breakWidth : width}
      height={isBreakHeight ? breakHeight : height}
    >
      <div ref={containerRef} style={containerStyle}>
        <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
          {children}
        </ConfigProvider>
      </div>
    </Drawer>
  );
});
