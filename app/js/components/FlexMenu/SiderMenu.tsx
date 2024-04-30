/**
 * @module SiderMenu
 */

import classNames from 'classnames';
import React, { memo, useMemo } from 'react';
import useStyles, { prefixUI } from './style';
import { Layout, MenuTheme, SiderProps } from 'antd';
import RouteMenu, { RouteMenuProps } from '/js/components/RouteMenu';

const { Sider } = Layout;

export interface HeaderRenderProps {
  readonly width: number;
  readonly height: number;
  readonly theme: MenuTheme;
  readonly isMobile: boolean;
  readonly collapsed: boolean;
  readonly collapsedWidth: number;
}

export type HeaderRender = (props: HeaderRenderProps) => React.ReactNode;

export interface SiderMenuProps
  extends Pick<SiderProps, 'trigger' | 'onCollapse'>,
    Omit<RouteMenuProps, 'mode' | 'inlineCollapsed'> {
  width?: number;
  isMobile?: boolean;
  collapsed?: boolean;
  headerHeight?: number;
  collapsedWidth?: number;
  headerRender?: HeaderRender;
}

export default memo(function SiderMenu({
  style,
  title,
  className,
  onCollapse,
  width = 256,
  headerRender,
  trigger = null,
  theme = 'light',
  isMobile = false,
  collapsed = false,
  headerHeight = 64,
  collapsedWidth = 64,
  ...restProps
}: SiderMenuProps): React.ReactElement {
  const [scope, render] = useStyles();

  const headerStyle = useMemo<React.CSSProperties>(() => {
    return {
      height: headerHeight
    };
  }, [headerHeight]);

  const menuStyle = useMemo<React.CSSProperties>(() => {
    return {
      height: `calc(100% - ${headerHeight}px)`
    };
  }, [headerHeight]);

  return render(
    <Sider
      collapsible
      style={style}
      theme={theme}
      width={width}
      trigger={trigger}
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsedWidth={collapsedWidth}
      className={classNames(scope, `${prefixUI}-sider`, `${prefixUI}-${theme}`, className)}
    >
      {headerRender && (
        <div className={`${prefixUI}-header`} style={headerStyle}>
          {headerRender({
            theme,
            width,
            isMobile,
            collapsed,
            collapsedWidth,
            height: headerHeight
          })}
        </div>
      )}
      <RouteMenu {...restProps} mode="inline" style={menuStyle} />
    </Sider>
  );
});
