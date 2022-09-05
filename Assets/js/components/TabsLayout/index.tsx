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
  icon?: boolean;
  className?: string;
  type?: 'line' | 'card';
  style?: React.CSSProperties;
}

export default memo(function TabsLayout({
  className,
  icon = true,
  destroyInactiveTabPane = true,
  ...restProps
}: TabsLayoutProps): React.ReactElement {
  const index = useMatchIndex();
  const match = useMatch() as IRoute<Meta>;
  const matches = useMatches() as IRoute<Meta>[];
  const activeKey = useMemo(() => matches[index + 1]?.meta.key, [matches, index]);

  const items = useMemo(() => {
    return match.children?.map(({ meta, element }) => {
      const { key, link } = meta;

      return {
        key,
        label: (
          <Link
            href={link.href}
            target={link.target}
            className={classNames(`${prefixUI}-nav`, { active: activeKey === meta.key })}
          >
            {icon && <SmartIcon icon={meta.icon} className={iconClassName} />}
            {meta.name}
          </Link>
        ),
        children: <Suspense fallback={<SuspenseFallBack />}>{element || <Outlet />}</Suspense>
      };
    });
  }, [match]);

  return (
    <Tabs
      {...restProps}
      items={items}
      activeKey={activeKey}
      className={classNames(prefixUI, className)}
      destroyInactiveTabPane={destroyInactiveTabPane}
    />
  );
});
