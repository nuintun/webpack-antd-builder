/**
 * @module index
 */

import { Meta } from '/js/router';
import classNames from 'classnames';
import Link from '/js/components/Link';
import { IRoute } from '/js/utils/router';
import FlexIcon from '/js/components/FlexIcon';
import useStyles, { prefixCls } from './style';
import React, { memo, Suspense, useMemo } from 'react';
import { ConfigProvider, Tabs, TabsProps } from 'antd';
import LoadingFallBack from '/js/components/FallBack/Loading';
import { Outlet, useMatch, useMatches, useMatchIndex } from 'react-nest-router';

type TabsPicked =
  | 'size'
  | 'style'
  | 'animated'
  | 'centered'
  | 'moreIcon'
  | 'className'
  | 'tabBarStyle'
  | 'tabPosition'
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
  tabPosition,
  tabBarGutter = 16,
  icon: showIcon = true,
  ...restProps
}: RouteTabsProps): React.ReactElement {
  const index = useMatchIndex();
  const [scope, render] = useStyles();
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
          <Suspense fallback={<LoadingFallBack />}>
            <Outlet />
          </Suspense>
        ),
        label: (
          <Link
            href={link.href}
            target={link.target}
            className={classNames(`${prefixCls}-nav`, {
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

  return render(
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
        activeKey={activeKey}
        destroyInactiveTabPane
        tabPosition={tabPosition}
        tabBarGutter={tabBarGutter}
        className={classNames(scope, prefixCls, className, {
          [`${prefixCls}-vertical`]: tabPosition === 'left' || tabPosition === 'right'
        })}
      />
    </ConfigProvider>
  );
});
