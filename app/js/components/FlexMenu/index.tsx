/**
 * @module index
 */

import React, { memo, useCallback, useRef } from 'react';

import { Drawer, DrawerProps } from 'antd';
import useStyle, { prefixUI } from './style';
import useLatestRef from '/js/hooks/useLatestRef';
import SiderMenu, { HeaderRender, HeaderRenderProps, SiderMenuProps as FlexMenuProps } from './SiderMenu';

export type { HeaderRender, HeaderRenderProps, FlexMenuProps };

const drawerStyles: DrawerProps['styles'] = { body: { padding: 0, overflow: 'hidden' } };

export default memo(function FlexMenu(props: FlexMenuProps): React.ReactElement {
  const { isMobile, collapsed, onCollapse, width = 256, onOpenChange, defaultOpenKeys = [], ...restProps } = props;

  const { render } = useStyle();
  const propsRef = useLatestRef(props);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys);

  const onClose = useCallback(() => {
    const { onCollapse } = propsRef.current;

    onCollapse?.(true, 'clickTrigger');
  }, []);

  const onOpenChangeHander = useCallback<NonNullable<FlexMenuProps['onOpenChange']>>((openKeys, cachedOpenKeys) => {
    const { collapsed, onOpenChange } = propsRef.current;

    if (!collapsed) {
      cachedOpenKeysRef.current = cachedOpenKeys;
    }

    onOpenChange?.(openKeys, cachedOpenKeys);
  }, []);

  return render(
    isMobile ? (
      <Drawer
        width={width}
        closable={false}
        placement="left"
        onClose={onClose}
        open={!collapsed}
        styles={drawerStyles}
        rootClassName={`${prefixUI}-drawer`}
      >
        <SiderMenu
          {...restProps}
          width={width}
          collapsed={false}
          isMobile={isMobile}
          onCollapse={onCollapse}
          onOpenChange={onOpenChangeHander}
          defaultOpenKeys={cachedOpenKeysRef.current}
        />
      </Drawer>
    ) : (
      <SiderMenu
        {...restProps}
        width={width}
        isMobile={isMobile}
        collapsed={collapsed}
        onCollapse={onCollapse}
        onOpenChange={onOpenChangeHander}
        defaultOpenKeys={cachedOpenKeysRef.current}
      />
    )
  );
});
