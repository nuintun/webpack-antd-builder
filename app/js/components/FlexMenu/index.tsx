/**
 * @module index
 */

import classNames from 'classnames';
import useStyles, { prefixUI } from './style';
import useLatestRef from '/js/hooks/useLatestRef';
import { Drawer, Layout, MenuTheme, SiderProps } from 'antd';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import RouteMenu, { RouteMenuProps } from '/js/components/RouteMenu';

const { Sider } = Layout;

export interface RenderHeaderProps {
  readonly width: number;
  readonly theme: MenuTheme;
  readonly isMobile: boolean;
  readonly collapsed: boolean;
  readonly collapsedWidth: number;
}

export interface FlexMenuProps
  extends Pick<SiderProps, 'trigger' | 'onCollapse'>,
    Omit<RouteMenuProps, 'mode' | 'inlineCollapsed'> {
  width?: number;
  isMobile?: boolean;
  collapsed?: boolean;
  collapsedWidth?: number;
  renderHeader?: RenderHeader;
}

export type OnOpenChange = NonNullable<FlexMenuProps['onOpenChange']>;

export type RenderHeader = (props: RenderHeaderProps) => React.ReactNode;

export default memo(function FlexMenu(props: FlexMenuProps): React.ReactElement {
  const {
    className,
    onCollapse,
    width = 256,
    onOpenChange,
    renderHeader,
    trigger = null,
    theme = 'light',
    isMobile = false,
    collapsed = false,
    collapsedWidth = 64,
    defaultOpenKeys = [],
    ...restProps
  } = props;

  const [scope, render] = useStyles();
  const propsRef = useLatestRef(props);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys);

  const drawerStyles = useMemo(() => {
    return { body: { padding: 0, overflow: 'hidden' } };
  }, []);

  const rootClassName = useMemo(() => {
    return classNames(scope, prefixUI, className, `${prefixUI}-${theme}`, {
      [`${prefixUI}-mobile`]: isMobile
    });
  }, [scope, theme, isMobile, className]);

  const onClose = useCallback(() => {
    const { onCollapse } = propsRef.current;

    onCollapse?.(true, 'clickTrigger');
  }, []);

  const onOpenChangeHander = useCallback<OnOpenChange>((openKeys, cachedOpenKeys) => {
    const { collapsed, onOpenChange } = propsRef.current;

    if (!collapsed) {
      cachedOpenKeysRef.current = cachedOpenKeys;
    }

    onOpenChange?.(openKeys, cachedOpenKeys);
  }, []);

  const menu = (
    <>
      {renderHeader && (
        <div className={`${prefixUI}-header`}>
          {renderHeader({
            theme,
            width,
            isMobile,
            collapsed,
            collapsedWidth
          })}
        </div>
      )}
      <RouteMenu
        {...restProps}
        mode="inline"
        className={`${prefixUI}-body`}
        onOpenChange={onOpenChangeHander}
        defaultOpenKeys={cachedOpenKeysRef.current}
      />
    </>
  );

  return render(
    isMobile ? (
      <Drawer
        width={width}
        closable={false}
        placement="left"
        onClose={onClose}
        open={!collapsed}
        styles={drawerStyles}
        className={rootClassName}
      >
        {menu}
      </Drawer>
    ) : (
      <Sider
        collapsible
        theme={theme}
        width={width}
        trigger={trigger}
        collapsed={collapsed}
        onCollapse={onCollapse}
        className={rootClassName}
        collapsedWidth={collapsedWidth}
      >
        {menu}
      </Sider>
    )
  );
});
