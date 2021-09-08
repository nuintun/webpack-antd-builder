import React, { memo, useCallback, useRef } from 'react';

import useMedia from '~js/hooks/useMedia';
import { isString } from '~js/utils/utils';
import { ConfigProvider, Drawer, DrawerProps } from 'antd';

const containerStyle: React.CSSProperties = { position: 'relative' };

export interface FlexDrawerProps extends DrawerProps {
  children?: React.ReactNode;
}

export default memo(function FlexDrawer({
  children,
  width = 576,
  height = 576,
  ...restProps
}: FlexDrawerProps): React.ReactElement {
  const container = useRef<HTMLDivElement>(null);
  const getContainer = useCallback(() => container.current || document.body, []);
  const isBrokenWidth = useMedia(`(max-width: ${isString(width) ? width : `${width}px`})`);
  const isBrokenHeight = useMedia(`(max-height: ${isString(height) ? height : `${height}px`})`);

  return (
    <Drawer {...restProps} width={isBrokenWidth ? '100%' : width} height={isBrokenHeight ? '100%' : height}>
      <div ref={container} style={containerStyle}>
        <ConfigProvider getPopupContainer={getContainer} getTargetContainer={getContainer}>
          {children}
        </ConfigProvider>
      </div>
    </Drawer>
  );
});
