/**
 * @module SiderMenu
 */

import React, { memo, useMemo } from 'react';

import { prefixUI } from './utils';
import classNames from 'classnames';
import useBorderSize from './useBorderSize';
import { Layout, MenuTheme, SiderProps } from 'antd';
import RouteMenu, { RouteMenuProps } from './RouteMenu';
import { useStyleSheets } from '/js/hooks/useStyleSheets';

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
  const borderSize = useBorderSize();

  const render = useStyleSheets(['components', 'FlexMenu'], token => {
    const { fontSizeLG } = token;
    const borderSplit = `${borderSize}px ${token.lineType} ${token.colorSplit}`;

    return {
      '.ui-component': {
        [`&.${prefixUI}-sider`]: {
          height: '100%',
          overflow: 'hidden',

          [`.${prefixUI}-header`]: {
            display: 'flex',
            overflow: 'hidden',
            placeItems: 'center',
            whiteSpace: 'nowrap',
            wordBreak: 'keep-all',
            borderBlockEnd: borderSplit,
            color: token.colorPrimaryText
          },

          [`.${prefixUI}`]: {
            overflow: 'auto',
            userSelect: 'none',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            msScrollChaining: 'none',
            OverscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',

            [`&.${prefixUI}-border`]: {
              borderInlineEnd: borderSplit
            },

            '&::-webkit-scrollbar': {
              display: 'none'
            },

            [`.${prefixUI}-title`]: {
              overflow: 'hidden',
              fontSize: fontSizeLG,
              textOverflow: 'ellipsis',

              [`.${prefixUI}-icon`]: {
                lineHeight: 0,
                fontSize: fontSizeLG,

                '> img': {
                  height: fontSizeLG
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
      className={classNames('ui-component', `${prefixUI}-sider`, className)}
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
