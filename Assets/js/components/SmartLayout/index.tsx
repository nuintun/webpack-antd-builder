import './index.less';

import React, { memo, Suspense, useCallback, useRef, useState } from 'react';

import useMedia from '~js/hooks/useMedia';
import useStorage from '~js/hooks/useStorage';
import { ConfigProvider, Layout } from 'antd';
import { BreadcrumbItem } from '~js/utils/parseRouter';
import SmartBreadcrumb from '~js/components/SmartBreadcrumb';
import usePersistCallback from '~js/hooks/usePersistCallback';
import SuspenseFallBack from '~js/components/SuspenseFallBack';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import SmartMenu, { HeaderRender, SmartMenuProps } from '~js/components/SmartMenu';

const { Header, Content } = Layout;

type PickProps = 'theme' | 'menus' | 'match' | 'history' | 'location' | 'collapsedWidth';

export interface SmartLayoutProps<T> extends Pick<SmartMenuProps<T>, PickProps> {
  roles?: any;
  siderWith?: number;
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
    menus,
    history,
    children,
    location,
    siderWith,
    breadcrumbs,
    theme = 'dark',
    collapsedWidth,
    leftHeaderRender,
    rightHeaderRender,
    mobileQuery = '(max-width: 576px)',
    brokenQuery = '(max-width: 992px)'
  } = props;

  const contentRef = useRef<HTMLDivElement>(null);

  const onMobileChange = useCallback(isMobile => {
    isMobile && setCollapsed(isMobile);
  }, []);

  const onBrokenChange = useCallback(isBroken => {
    !readCollapsed() && setCollapsed(isBroken);
  }, []);

  const isMobile = useMedia(mobileQuery, onMobileChange);
  const isBroken = useMedia(brokenQuery, onBrokenChange);
  const [writeCollapsed, readCollapsed] = useStorage<boolean>('collapsed');
  const [collapsed, setCollapsed] = useState(() => isBroken || isMobile || !!readCollapsed());

  const onTriggerClick = usePersistCallback(() =>
    setCollapsed(collapsed => {
      collapsed = !collapsed;

      writeCollapsed(collapsed);

      return collapsed;
    })
  );

  const onCollapse = useCallback((collapsed: boolean) => {
    setCollapsed(collapsed);
  }, []);

  const getPopupContainer = useCallback(triggerNode => {
    const { body } = document;

    return triggerNode === body ? triggerNode : contentRef.current || body;
  }, []);

  const getTargetContainer = useCallback(() => contentRef.current || document.body, []);

  return (
    <Layout hasSider={!isMobile} className={`${prefixUI} ${prefixUI}-${theme}`}>
      <SmartMenu
        theme={theme}
        match={match}
        menus={menus}
        width={siderWith}
        history={history}
        isMobile={isMobile}
        location={location}
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
              width: siderWith as number,
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
              width: siderWith as number,
              collapsedWidth: collapsedWidth as number
            })}
        </Header>
        <Content>
          <div ref={contentRef} className={`${prefixUI}-content`}>
            <ConfigProvider getPopupContainer={getPopupContainer} getTargetContainer={getTargetContainer}>
              <SmartBreadcrumb match={match} location={location} history={history} breadcrumbs={breadcrumbs} />
              <Suspense fallback={<SuspenseFallBack />}>{children}</Suspense>
            </ConfigProvider>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default memo(SmartLayout) as typeof SmartLayout;
