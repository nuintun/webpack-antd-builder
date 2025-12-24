/**
 * @module index
 */

import clsx from 'clsx';
import useStorage from '/js/hooks/useStorage';
import { ConfigProvider, Layout } from 'antd';
import useStyles, { prefixCls } from './style';
import useMediaQuery from '/js/hooks/useMediaQuery';
import RouteBreadcrumb from '/js/components/RouteBreadcrumb';
import LoadingFallback from '/js/components/Fallback/Loading';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import React, { memo, Suspense, useCallback, useRef, useState } from 'react';
import FlexMenu, { FlexMenuProps, RenderHeader } from '/js/components/FlexMenu';

const { Header, Content } = Layout;

type PickProps = 'theme' | 'collapsedWidth';

export interface FlexLayoutProps extends Pick<FlexMenuProps, PickProps> {
  breakQuery?: string;
  siderWidth?: number;
  mobileQuery?: string;
  children?: React.ReactNode;
  menus: FlexMenuProps['items'];
  renderLogoHeader?: RenderHeader;
  renderActionsHeader?: RenderHeader;
}

export default memo(function FlexLayout(props: FlexLayoutProps) {
  const {
    menus,
    children,
    theme = 'light',
    renderLogoHeader,
    siderWidth = 256,
    collapsedWidth = 64,
    renderActionsHeader,
    breakQuery = '(max-width: 992px)',
    mobileQuery = '(max-width: 576px)'
  } = props;

  const scope = useStyles();
  const contentRef = useRef<HTMLDivElement>(null);

  const isBreak = useMediaQuery(breakQuery, isBreak => {
    !readCollapsed() && setCollapsed(isBreak);
  });
  const isMobile = useMediaQuery(mobileQuery, isMobile => {
    isMobile && setCollapsed(isMobile);
  });

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

  const Trigger = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

  const logo = isMobile && renderLogoHeader?.({ theme, isMobile, collapsedWidth, collapsed: true, width: siderWidth });

  return (
    <Layout hasSider={!isMobile} className={clsx(scope, prefixCls, `${prefixCls}-${theme}`)}>
      <FlexMenu
        items={menus}
        theme={theme}
        width={siderWidth}
        isMobile={isMobile}
        collapsed={collapsed}
        onClick={onItemClick}
        onCollapse={onCollapse}
        collapsedWidth={collapsedWidth}
        renderHeader={renderLogoHeader}
      />
      <Layout>
        <Header className={`${prefixCls}-header`}>
          {logo && <div className={`${prefixCls}-logo-header`}>{logo}</div>}
          <div className={`${prefixCls}-actions-header`}>
            <Trigger onClick={onTriggerClick} className={`${prefixCls}-trigger`} />
            {renderActionsHeader?.({ theme, isMobile, collapsed, collapsedWidth, width: siderWidth })}
          </div>
        </Header>
        <Content>
          <div ref={contentRef} className={`${prefixCls}-content`}>
            <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
              <RouteBreadcrumb />
              <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
            </ConfigProvider>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
});
