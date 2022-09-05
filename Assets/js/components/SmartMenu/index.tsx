import './index.less';

import React, { memo, useCallback, useRef } from 'react';

import { Drawer } from 'antd';
import { prefixUI } from './SmartMenuUtils';
import useSyncRef from '/js/hooks/useSyncRef';
import SiderMenu, { HeaderRender, HeaderRenderProps, SiderMenuProps as SmartMenuProps } from './SiderMenu';

export type { HeaderRender, HeaderRenderProps, SmartMenuProps };

export default memo(function SmartMenu(props: SmartMenuProps): React.ReactElement {
  const { isMobile, collapsed, onCollapse, width = 256, onOpenChange, defaultOpenKeys = [], ...restProps } = props;

  const propsRef = useSyncRef(props);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys);

  const onClose = useCallback((): void => {
    const { onCollapse } = propsRef.current;

    onCollapse && onCollapse(true, 'clickTrigger');
  }, []);

  const onOpenChangeHander = useCallback((openKeys: string[], cachedOpenKeys: string[]) => {
    const { collapsed, onOpenChange } = propsRef.current;

    if (!collapsed) {
      cachedOpenKeysRef.current = cachedOpenKeys;
    }

    onOpenChange && onOpenChange(openKeys, cachedOpenKeys);
  }, []);

  if (isMobile) {
    return (
      <Drawer
        width={width}
        closable={false}
        placement="left"
        open={!collapsed}
        onClose={onClose}
        className={`${prefixUI}-drawer`}
      >
        <SiderMenu
          {...restProps}
          width={width}
          collapsed={false}
          isMobile={isMobile}
          onCollapse={onCollapse}
          onOpenChange={onOpenChangeHander}
          defaultOpenKeys={collapsed ? [] : cachedOpenKeysRef.current}
        />
      </Drawer>
    );
  }

  return (
    <SiderMenu
      {...restProps}
      width={width}
      isMobile={isMobile}
      collapsed={collapsed}
      onCollapse={onCollapse}
      onOpenChange={onOpenChangeHander}
      defaultOpenKeys={cachedOpenKeysRef.current}
    />
  );
});
