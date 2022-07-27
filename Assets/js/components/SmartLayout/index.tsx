import './index.less';

import React, { memo, Suspense, useCallback, useRef, useState } from 'react';

import { Layout } from 'antd';
import useMedia from '/js/hooks/useMedia';
import useStorage from '/js/hooks/useStorage';
import Configure from '/js/components/Configure';
import { BreadcrumbItem } from '/js/utils/router';
import SmartBreadcrumb from '/js/components/SmartBreadcrumb';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import SmartMenu, { HeaderRender, SmartMenuProps } from '/js/components/SmartMenu';

const { Header, Content } = Layout;

type PickProps = 'theme' | 'items' | 'match' | 'history' | 'location' | 'collapsedWidth';

export interface SmartLayoutProps<T> extends Pick<SmartMenuProps<T>, PickProps> {
  siderWidth?: number;
  mobileQuery?: string;
  brokenQuery?: string;
  children?: React.ReactNode;
  leftHeaderRender?: HeaderRender;
  rightHeaderRender?: HeaderRender;
  breadcrumbs: { [path: string]: BreadcrumbItem<T> };
}

const prefixUI = 'ui-smart-layout';
const triggerClassName = `${prefixUI}-sider-trigger`;

function SmartLayout<T>(props: SmartLayoutProps<T>): React.ReactElement {
  const {
    match,
    items,
    history,
    children,
    location,
    siderWidth,
    breadcrumbs,
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
        match={match}
        items={items}
        history={history}
        width={siderWidth}
        isMobile={isMobile}
        location={location}
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
            <Configure virtual getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
              <SmartBreadcrumb match={match} location={location} history={history} breadcrumbs={breadcrumbs} />
              <Suspense fallback={<SuspenseFallBack />}>{children}</Suspense>
            </Configure>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default memo(SmartLayout) as typeof SmartLayout;
