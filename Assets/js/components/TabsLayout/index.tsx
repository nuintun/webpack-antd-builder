import './index.less';

import React, { memo, Suspense, useMemo } from 'react';

import classNames from 'classnames';
import Link from '/js/components/Link';
import { Tabs, TabsProps } from 'antd';
import { Meta } from '/js/config/router';
import { IRoute } from '/js/utils/router';
import SmartIcon from '/js/components/SmartIcon';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { Outlet, useMatch, useMatches, useMatchIndex } from 'react-nest-router';

const { TabPane } = Tabs;
const prefixUI = 'ui-tabs-layout';
const iconClassName = `${prefixUI}-icon`;

type TabsPicked =
  | 'size'
  | 'animated'
  | 'centered'
  | 'moreIcon'
  | 'tabBarStyle'
  | 'tabPosition'
  | 'tabBarGutter'
  | 'renderTabBar'
  | 'popupClassName'
  | 'tabBarExtraContent'
  | 'destroyInactiveTabPane';

export interface TabsLayoutProps extends Pick<TabsProps, TabsPicked> {
  type?: 'line' | 'card';
  icon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default memo(function TabsLayout({
  className,
  icon = true,
  destroyInactiveTabPane = true,
  ...restProps
}: TabsLayoutProps): React.ReactElement {
  const index = useMatchIndex();
  const matches = useMatches() as IRoute<Meta>[];
  const { children: tabs = [] } = useMatch() as IRoute<Meta>;
  const activeKey = useMemo(() => matches[index + 1]?.meta.key, [matches, index]);

  return (
    <Tabs
      {...restProps}
      activeKey={activeKey}
      className={classNames(prefixUI, className)}
      destroyInactiveTabPane={destroyInactiveTabPane}
    >
      {tabs.map(({ meta, element }) => {
        const { link } = meta;

        return (
          <TabPane
            key={meta.key}
            tab={
              <Link
                href={link.href}
                target={link.target}
                className={classNames(`${prefixUI}-nav`, { active: activeKey === meta.key })}
              >
                {icon && <SmartIcon icon={meta.icon} className={iconClassName} />}
                {meta.name}
              </Link>
            }
          >
            <Suspense fallback={<SuspenseFallBack />}>{element || <Outlet />}</Suspense>
          </TabPane>
        );
      })}
    </Tabs>
  );
});
