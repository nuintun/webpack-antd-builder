import './index.less';

import React, { memo, Suspense, useCallback, useRef, useState } from 'react';

import useMedia from '/js/hooks/useMedia';
import useStorage from '/js/hooks/useStorage';
import { ConfigProvider, Layout } from 'antd';
import SmartBreadcrumb from '/js/components/SmartBreadcrumb';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import SmartMenu, { HeaderRender, SmartMenuProps } from '/js/components/SmartMenu';

const { Header, Content } = Layout;

type PickProps = 'theme' | 'collapsedWidth';

export interface SmartLayoutProps extends Pick<SmartMenuProps, PickProps> {
  siderWidth?: number;
  mobileQuery?: string;
  brokenQuery?: string;
  children?: React.ReactNode;
  menus: SmartMenuProps['items'];
  leftHeaderRender?: HeaderRender;
  rightHeaderRender?: HeaderRender;
}

const prefixUI = 'ui-smart-layout';
const triggerClassName = `${prefixUI}-sider-trigger`;

export default memo(function SmartLayout(props: SmartLayoutProps): React.ReactElement {
  const {
    menus,
    children,
    siderWidth,
    theme = 'dark',
    collapsedWidth,
    leftHeaderRender,
    rightHeaderRender,
    mobileQuery = '(max-width: 576px)',
    brokenQuery = '(max-width: 992px)'
  } = props;

  const contentRef = useRef<HTMLDivElement>(null);

  const onMobileChange = useCallback((isMobile: boolean) => {
    isMobile && setCollapsed(isMobile);
  }, []);

  const onBrokenChange = useCallback((isBroken: boolean) => {
    !readCollapsed() && setCollapsed(isBroken);
  }, []);

  const isMobile = useMedia(mobileQuery, onMobileChange);
  const isBroken = useMedia(brokenQuery, onBrokenChange);
  const [writeCollapsed, readCollapsed] = useStorage<boolean>('collapsed');
  const [collapsed, setCollapsed] = useState(() => isBroken || isMobile || !!readCollapsed());

  const onItemClick = useCallback(() => {
    if (isMobile) {
      setCollapsed(true);
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

  return (
    <Layout hasSider={!isMobile} className={`${prefixUI} ${prefixUI}-${theme}`}>
      <SmartMenu
        theme={theme}
        items={menus}
        width={siderWidth}
        isMobile={isMobile}
        onClick={onItemClick}
        collapsed={collapsed}
        onCollapse={onCollapse}
        headerRender={leftHeaderRender}
        collapsedWidth={collapsedWidth}
      />
      <Layout>
        <Header className={`${prefixUI}-header`}>
          {isMobile &&
            leftHeaderRender &&
            leftHeaderRender({
              theme,
              isMobile,
              collapsed: true,
              width: siderWidth as number,
              collapsedWidth: collapsedWidth as number
            })}
          {collapsed ? (
            <MenuUnfoldOutlined className={triggerClassName} onClick={onTriggerClick} />
          ) : (
            <MenuFoldOutlined className={triggerClassName} onClick={onTriggerClick} />
          )}
          {rightHeaderRender &&
            rightHeaderRender({
              theme,
              isMobile,
              collapsed,
              width: siderWidth as number,
              collapsedWidth: collapsedWidth as number
            })}
        </Header>
        <Content>
          <div ref={contentRef} className={`${prefixUI}-content`}>
            <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
              <SmartBreadcrumb />
              <Suspense fallback={<SuspenseFallBack />}>{children}</Suspense>
            </ConfigProvider>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
});
