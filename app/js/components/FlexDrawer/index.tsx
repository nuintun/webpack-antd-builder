/**
 * @module index
 */

import { memo, useCallback, useRef } from 'react';
import { ConfigProvider, Drawer, DrawerProps, GetProp } from 'antd';

const drawerStyles: GetProp<DrawerProps, 'styles'> = {
  wrapper: {
    maxWidth: '100vw',
    maxHeight: '100vh'
  }
};

export interface FlexDrawerProps extends DrawerProps {}

export default memo(function FlexDrawer({
  children,
  height = 720,
  width = 1440,
  closeIcon = false,
  styles = drawerStyles,
  ...restProps
}: FlexDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getPopupContainer = useCallback((triggerNode?: HTMLElement) => {
    const { body } = document;
    const { current } = containerRef;

    return triggerNode === body || current === null ? body : current;
  }, []);

  const getTargetContainer = useCallback(() => containerRef.current || document.body, []);

  return (
    <Drawer
      {...restProps}
      width={width}
      height={height}
      closeIcon={closeIcon}
      styles={{
        ...styles,
        body: {
          ...styles.body,
          outline: 'none',
          position: 'relative',
          minWidth: 'fit-content'
        }
      }}
    >
      <div ref={containerRef}>
        <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
          {children}
        </ConfigProvider>
      </div>
    </Drawer>
  );
});
