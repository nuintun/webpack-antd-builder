import './index.less';

import React, { memo, Suspense, useCallback, useRef, useState } from 'react';

import useMedia from '~js/hooks/useMedia';
import useStorage from '~js/hooks/useStorage';
import { ConfigProvider, Layout } from 'antd';
import { BreadcrumbItem } from '~js/utils/getRouter';
import SmartBreadcrumb from '~js/components/SmartBreadcrumb';
import usePersistCallback from '~js/hooks/usePersistCallback';
import SuspenseFallBack from '~js/components/SuspenseFallBack';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import SmartMenu, { HeaderRender, SmartMenuMenuProps } from '~js/components/SmartMenu';

const { Header, Content } = Layout;
const mobileQuery = '(max-width: 480px)';
const brokenQuery = '(max-width: 992px)';

type PickProps = 'theme' | 'match' | 'history' | 'location' | 'menuData' | 'collapsedWidth';

export interface SmartLayoutProps extends Pick<SmartMenuMenuProps, PickProps> {
  roles?: any;
  siderWith?: number;
  children?: React.ReactNode;
  leftHeaderRender?: HeaderRender;
  rightHeaderRender?: HeaderRender;
  breadcrumbs: { [path: string]: BreadcrumbItem };
}

const prefixUI = 'ui-smart-layout';
const triggerClassName = `${prefixUI}-sider-trigger`;

export default memo(function SmartLayout(props: SmartLayoutProps): React.ReactElement {
  const {
    theme = 'dark',
    match,
    history,
    children,
    location,
    menuData,
    siderWith,
    breadcrumbs,
    collapsedWidth,
    leftHeaderRender,
    rightHeaderRender
  } = props;

  const contentRef = useRef(null);
  const isMobile = useMedia(mobileQuery);
  const [setCollapsedStore, getCollapsedStore] = useStorage<boolean>('collapsed');

  const onBrokenChange = useCallback(collapsed => {
    !getCollapsedStore() && setCollapsed(collapsed);
  }, []);

  const isBroken = useMedia(brokenQuery, onBrokenChange);
  const [collapsed, setCollapsed] = useState(() => isBroken || isMobile || !!getCollapsedStore());

  const onTriggerClick = usePersistCallback(() =>
    setCollapsed(collapsed => {
      collapsed = !collapsed;

      setCollapsedStore(collapsed);

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
        width={siderWith}
        history={history}
        isMobile={isMobile}
        menuData={menuData}
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
});
