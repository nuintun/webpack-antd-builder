/**
 * @module index
 */

import { isString } from '/js/utils/utils';
import { memo, useCallback, useRef } from 'react';
import useMediaQuery from '/js/hooks/useMediaQuery';
import { ConfigProvider, Drawer, DrawerProps } from 'antd';

export interface FlexDrawerProps extends DrawerProps {
  breakWidth?: string | number;
  breakHeight?: string | number;
}

export default memo(function FlexDrawer({
  children,
  height = 720,
  width = 1440,
  keyboard = false,
  closeIcon = false,
  maskClosable = false,
  breakWidth = '100vw',
  breakHeight = '100vh',
  styles = { body: { position: 'relative' } },
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
      keyboard={keyboard}
      closeIcon={closeIcon}
      maskClosable={maskClosable}
      width={isBreakWidth ? breakWidth : width}
      height={isBreakHeight ? breakHeight : height}
    >
      <div ref={containerRef}>
        <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
          {children}
        </ConfigProvider>
      </div>
    </Drawer>
  );
});
