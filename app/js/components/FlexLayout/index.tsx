import React, { memo, Suspense, useCallback, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import useMedia from '/js/hooks/useMedia';
import useStyle, { prefixUI } from './style';
import useStorage from '/js/hooks/useStorage';
import { ConfigProvider, Layout } from 'antd';
import RouteBreadcrumb from '/js/components/RouteBreadcrumb';
import { getBorderSize } from '/js/components/FlexMenu/utils';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import FlexMenu, { FlexMenuProps, HeaderRender } from '/js/components/FlexMenu';

const { Header, Content } = Layout;

type PickProps = 'theme' | 'headerHeight' | 'collapsedWidth';

export interface FlexLayoutProps extends Pick<FlexMenuProps, PickProps> {
  siderWidth?: number;
  breakQuery?: string;
  mobileQuery?: string;
  children?: React.ReactNode;
  menus: FlexMenuProps['items'];
  leftHeaderRender?: HeaderRender;
  rightHeaderRender?: HeaderRender;
}

export default memo(function FlexLayout(props: FlexLayoutProps): React.ReactElement {
  const {
    menus,
    children,
    theme = 'light',
    leftHeaderRender,
    siderWidth = 256,
    headerHeight = 64,
    rightHeaderRender,
    collapsedWidth = 64,
    breakQuery = '(max-width: 992px)',
    mobileQuery = '(max-width: 576px)'
  } = props;

  const { token, render } = useStyle();

  const borderSize = getBorderSize(token);

  const contentRef = useRef<HTMLDivElement>(null);

  const onBreakChange = useCallback((isBreak: boolean) => {
    !readCollapsed() && setCollapsed(isBreak);
  }, []);

  const onMobileChange = useCallback((isMobile: boolean) => {
    isMobile && setCollapsed(isMobile);
  }, []);

  const isBreak = useMedia(breakQuery, onBreakChange);
  const isMobile = useMedia(mobileQuery, onMobileChange);
  const [writeCollapsed, readCollapsed] = useStorage<boolean>('collapsed');
  const [collapsed, setCollapsed] = useState(() => isBreak || isMobile || !!readCollapsed());

  const onItemClick = useCallback(() => {
    if (isMobile) {
      setCollapsed(true);
    }

    const { current } = contentRef;

    if (current) {
      current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [isMobile]);

  const onTriggerClick = useCallback(() => {
    setCollapsed(collapsed => {
      collapsed = !collapsed;

      writeCollapsed(collapsed);

      return collapsed;
    });
  }, []);

  const onCollapse = useCallback((collapsed: boolean) => {
    setCollapsed(collapsed);
  }, []);

  const getPopupContainer = useCallback((triggerNode?: HTMLElement) => {
    const { body } = document;
    const { current } = contentRef;

    return triggerNode === body || current === null ? body : current;
  }, []);

  const getTargetContainer = useCallback(() => contentRef.current || document.body, []);

  const headerStyle = useMemo<React.CSSProperties>(() => {
    return {
      height: headerHeight,
      lineHeight: `${headerHeight - borderSize}px`
    };
  }, [headerHeight, borderSize]);

  return render(
    <Layout hasSider={!isMobile} className={classNames('ui-component', prefixUI, `${prefixUI}-${theme}`)}>
      <FlexMenu
        items={menus}
        theme={theme}
        width={siderWidth}
        isMobile={isMobile}
        collapsed={collapsed}
        onClick={onItemClick}
        onCollapse={onCollapse}
        headerHeight={headerHeight}
        collapsedWidth={collapsedWidth}
        headerRender={leftHeaderRender}
      />
      <Layout>
        <Header style={headerStyle} className={`${prefixUI}-header`}>
          {isMobile &&
            leftHeaderRender &&
            leftHeaderRender({
              theme,
              isMobile,
              collapsedWidth,
              collapsed: true,
              width: siderWidth,
              height: headerHeight - borderSize
            })}
          <div className={`${prefixUI}-header-right`}>
            {collapsed ? (
              <MenuUnfoldOutlined onClick={onTriggerClick} className={`${prefixUI}-trigger`} />
            ) : (
              <MenuFoldOutlined onClick={onTriggerClick} className={`${prefixUI}-trigger`} />
            )}
            {rightHeaderRender &&
              rightHeaderRender({
                theme,
                isMobile,
                collapsed,
                collapsedWidth,
                width: siderWidth,
                height: headerHeight - borderSize
              })}
          </div>
        </Header>
        <Content>
          <div ref={contentRef} className={`${prefixUI}-content`}>
            <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
              <RouteBreadcrumb />
              <Suspense fallback={<SuspenseFallBack />}>{children}</Suspense>
            </ConfigProvider>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
});
