/**
 * @module SiderMenu
 */

import React, { memo } from 'react';

import { prefixUI } from './utils';
import classNames from 'classnames';
import { Layout, MenuTheme, SiderProps } from 'antd';
import RouteMenu, { RouteMenuProps } from './RouteMenu';
import { useStyleSheets } from '/js/hooks/useStyleSheets';

const { Sider } = Layout;

export interface HeaderRenderProps {
  width: number;
  height: number;
  theme: MenuTheme;
  isMobile: boolean;
  collapsed: boolean;
  collapsedWidth: number;
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
  theme = 'dark',
  trigger = null,
  isMobile = false,
  collapsed = false,
  headerHeight = 64,
  collapsedWidth = 64,
  ...restProps
}: SiderMenuProps): React.ReactElement {
  const render = useStyleSheets(['components', 'FlexMenu'], token => {
    const borderSize = token.Menu?.colorActiveBarBorderSize;
    const lineWidth = borderSize ?? theme == 'light' ? token.lineWidth : 0;
    const borderSplit = `${lineWidth}px ${token.lineType} ${token.colorSplit}`;

    return {
      '.ui-component': {
        [`&.${prefixUI}-sider`]: {
          height: '100%',
          overflow: 'hidden',
          [`.${prefixUI}-header`]: {
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            height: headerHeight,
            whiteSpace: 'nowrap',
            wordBreak: 'keep-all',
            color: token.colorText,
            justifyItems: 'center',
            borderBlockEnd: borderSplit
          },
          [`.${prefixUI}`]: {
            overflow: 'auto',
            userSelect: 'none',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            msScrollChaining: 'none',
            OverscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            height: `calc(100% - ${headerHeight}px)`,
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            [`.${prefixUI}-title`]: {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: token.fontSizeLG,
              [`.${prefixUI}-icon`]: {
                lineHeight: 0,
                fontSize: token.fontSizeLG,
                '> img': {
                  height: token.fontSizeLG
                },
                '+ span': {
                  marginInlineStart: token.marginXXS
                }
              }
            }
          }
        }
      }
    };
  });

  return render(
    <Sider
      collapsible
      width={width}
      theme={theme}
      style={style}
      trigger={trigger}
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsedWidth={collapsedWidth}
      className={classNames('ui-component', `${prefixUI}-sider`, className)}
    >
      {headerRender && (
        <div className={`${prefixUI}-header`}>
          {headerRender({ width, theme, isMobile, collapsed, collapsedWidth, height: headerHeight })}
        </div>
      )}
      <RouteMenu {...restProps} theme={theme} collapsed={collapsed} className={prefixUI} />
    </Sider>
  );
});
