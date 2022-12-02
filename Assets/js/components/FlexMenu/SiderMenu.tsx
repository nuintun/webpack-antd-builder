/**
 * @module SiderMenu
 */

import React, { memo, useMemo } from 'react';

import classNames from 'classnames';
import { getBorderSize } from './utils';
import useStyle, { prefixUI } from './style';
import { Layout, MenuTheme, SiderProps } from 'antd';
import RouteMenu, { RouteMenuProps } from './RouteMenu';

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

export interface SiderMenuProps extends RouteMenuProps, Pick<SiderProps, 'trigger' | 'onCollapse'> {
  width?: number;
  isMobile?: boolean;
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
  const { token, hashId, render } = useStyle();

  const borderSize = getBorderSize(token);

  const headerStyle = useMemo<React.CSSProperties>(() => {
    return {
      height: headerHeight,
      lineHeight: `${headerHeight - borderSize}px`
    };
  }, [headerHeight, borderSize]);

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
      className={classNames(hashId, 'ui-component', `${prefixUI}-sider`, className)}
    >
      {headerRender && (
        <div className={`${prefixUI}-header`} style={headerStyle}>
          {headerRender({
            theme,
            width,
            isMobile,
            collapsed,
            collapsedWidth,
            height: headerHeight - borderSize
          })}
        </div>
      )}
      <RouteMenu
        theme={theme}
        {...restProps}
        style={menuStyle}
        collapsed={collapsed}
        className={classNames(prefixUI, `${prefixUI}-border`)}
      />
    </Sider>
  );
});
