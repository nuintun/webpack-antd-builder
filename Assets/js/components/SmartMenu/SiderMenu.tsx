import React, { memo } from 'react';

import classNames from 'classnames';
import { Layout, MenuTheme } from 'antd';
import { prefixUI } from './SmartMenuUtils';
import { SiderProps } from 'antd/es/layout/Sider';
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

export interface SiderMenuProps extends RouteMenuProps, Pick<SiderProps, 'trigger' | 'onCollapse'> {
  width?: number;
  isMobile?: boolean;
  collapsedWidth?: number;
  headerRender?: HeaderRender;
}

export default memo(function SiderMenu({
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
}: SiderMenuProps): React.ReactElement {
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
        <div className={`${prefixUI}-header`}>
          {headerRender({
            width: width as number,
            theme: theme as MenuTheme,
            isMobile: isMobile as boolean,
            collapsed: collapsed as boolean,
            collapsedWidth: collapsedWidth as number
          })}
        </div>
      )}
      <RouteMenu {...restProps} theme={theme} collapsed={collapsed} className={prefixUI} />
    </Sider>
  );
});
