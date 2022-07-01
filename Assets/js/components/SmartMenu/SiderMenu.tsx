import React, { memo } from 'react';

import classNames from 'classnames';
import { prefixUI } from './SmartMenuUtils';
import { Layout, MenuTheme, SiderProps } from 'antd';
import RouteMenu, { RouteMenuProps } from './RouteMenu';

const { Sider } = Layout;

export interface HeaderRenderProps {
  width: number;
  theme: MenuTheme;
  isMobile: boolean;
  collapsed: boolean;
  collapsedWidth: number;
}

export type HeaderRender = (props: HeaderRenderProps) => React.ReactNode;

export interface SiderMenuProps<T> extends RouteMenuProps<T>, Pick<SiderProps, 'trigger' | 'onCollapse'> {
  width?: number;
  isMobile?: boolean;
  collapsedWidth?: number;
  headerRender?: HeaderRender;
}

function SiderMenu<T>({
  title,
  style,
  className,
  onCollapse,
  width = 256,
  headerRender,
  theme = 'dark',
  trigger = null,
  isMobile = false,
  collapsed = false,
  collapsedWidth = 64,
  ...restProps
}: SiderMenuProps<T>): React.ReactElement {
  return (
    <Sider
      collapsible
      width={width}
      theme={theme}
      style={style}
      trigger={trigger}
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsedWidth={collapsedWidth}
      className={classNames(`${prefixUI}-sider`, `${prefixUI}-${theme}`, className)}
    >
      {headerRender && (
        <div className={`${prefixUI}-header`}>{headerRender({ width, theme, isMobile, collapsed, collapsedWidth })}</div>
      )}
      <RouteMenu {...restProps} theme={theme} collapsed={collapsed} className={prefixUI} />
    </Sider>
  );
}

export default memo(SiderMenu) as typeof SiderMenu;
