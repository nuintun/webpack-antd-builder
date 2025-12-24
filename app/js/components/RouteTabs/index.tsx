/**
 * @module index
 */

import clsx from 'clsx';
import { Meta } from '/js/router';
import Link from '/js/components/Link';
import { IRoute } from '/js/utils/router';
import FlexIcon from '/js/components/FlexIcon';
import useStyles, { prefixCls } from './style';
import { memo, Suspense, useMemo } from 'react';
import { ConfigProvider, Tabs, TabsProps } from 'antd';
import LoadingFallback from '/js/components/Fallback/Loading';
import { Outlet, useMatch, useMatches, useMatchIndex } from 'react-nest-router';

type TabsPicked =
  | 'size'
  | 'style'
  | 'animated'
  | 'centered'
  | 'moreIcon'
  | 'className'
  | 'tabBarStyle'
  | 'tabPlacement'
  | 'renderTabBar'
  | 'tabBarGutter'
  | 'popupClassName'
  | 'tabBarExtraContent';

export interface RouteTabsProps extends Pick<TabsProps, TabsPicked> {
  icon?: boolean;
  type?: 'line' | 'card';
}

export default memo(function RouteTabs({
  className,
  tabPlacement,
  tabBarGutter = 16,
  icon: showIcon = true,
  ...restProps
}: RouteTabsProps) {
  const scope = useStyles();
  const index = useMatchIndex();
  const match = useMatch() as IRoute<Meta>;
  const matches = useMatches() as IRoute<Meta>[];
  const activeKey = useMemo(() => matches[index + 1]?.meta.key, [matches, index]);

  const items = useMemo<TabsProps['items']>(() => {
    return match.children?.map(({ meta }) => {
      const { key, link } = meta;
      const active = key === activeKey;

      return {
        key,
        children: active && (
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        ),
        label: (
          <Link
            to={link.href}
            target={link.target}
            className={clsx(`${prefixCls}-nav`, {
              [`${prefixCls}-active`]: active
            })}
          >
            {showIcon && <FlexIcon icon={meta.icon} className={`${prefixCls}-icon`} />}
            {meta.name}
          </Link>
        )
      };
    });
  }, [activeKey, match]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            cardHeight: 64
          }
        }
      }}
    >
      <Tabs
        {...restProps}
        items={items}
        destroyOnHidden
        activeKey={activeKey}
        tabPlacement={tabPlacement}
        tabBarGutter={tabBarGutter}
        className={clsx(scope, prefixCls, className, {
          [`${prefixCls}-vertical`]: tabPlacement === 'start' || tabPlacement === 'end'
        })}
      />
    </ConfigProvider>
  );
});
