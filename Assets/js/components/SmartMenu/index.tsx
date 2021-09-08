import './index.less';

import React, { memo, useRef } from 'react';

import { Drawer } from 'antd';
import { prefixUI } from './SmartMenuUtils';
import usePersistCallback from '~js/hooks/usePersistCallback';
import SiderMenu, { HeaderRender, HeaderRenderProps, SiderMenuProps as SmartMenuProps } from './SiderMenu';

export type { HeaderRender, HeaderRenderProps, SmartMenuProps };

export default memo(function SmartMenu({
  isMobile,
  collapsed,
  onCollapse,
  width = 256,
  onOpenChange,
  defaultOpenKeys = [],
  ...restProps
}: SmartMenuProps): React.ReactElement {
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys);

  const onClose = usePersistCallback((): void => {
    onCollapse && onCollapse(true, 'clickTrigger');
  });

  const onOpenChangeHander = usePersistCallback((openKeys: string[], cachedOpenKeys: string[]) => {
    if (!collapsed) {
      cachedOpenKeysRef.current = cachedOpenKeys;
    }

    onOpenChange && onOpenChange(openKeys, cachedOpenKeys);
  });

  if (isMobile) {
    return (
      <Drawer
        width={width}
        placement="left"
        closable={false}
        onClose={onClose}
        visible={!collapsed}
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
