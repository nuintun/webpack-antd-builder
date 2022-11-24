import React, { memo, Suspense, useMemo } from 'react';

import classNames from 'classnames';
import Link from '/js/components/Link';
import { Tabs, TabsProps } from 'antd';
import { Meta } from '/js/config/router';
import { IRoute } from '/js/utils/router';
import FlexIcon from '/js/components/FlexIcon';
import { useStyleSheets } from '/js/hooks/useStyleSheets';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { Outlet, useMatch, useMatches, useMatchIndex } from 'react-nest-router';

const prefixUI = 'ui-route-tabs';
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
  | 'tabBarExtraContent';

export interface RouteTabsProps extends Pick<TabsProps, TabsPicked> {
  icon?: boolean;
  className?: string;
  type?: 'line' | 'card';
  style?: React.CSSProperties;
}

export default memo(function RouteTabs({ className, icon = true, ...restProps }: RouteTabsProps): React.ReactElement {
  const index = useMatchIndex();
  const match = useMatch() as IRoute<Meta>;
  const matches = useMatches() as IRoute<Meta>[];
  const activeKey = useMemo(() => matches[index + 1]?.meta.key, [matches, index]);

  const [namespace, render] = useStyleSheets(prefixUI, token => {
    return {
      [`.${prefixUI}`]: {
        [`.${prefixUI}-nav`]: {
          color: token.colorText,
          '&.active': {
            color: token.colorLinkActive
          },
          [`.${prefixUI}-icon`]: {
            marginInlineEnd: token.marginXXS,

            '> img': {
              width: 'auto',
              height: token.size
            }
          }
        }
      }
    };
  });

  const items = useMemo<TabsProps['items']>(() => {
    return match.children?.map(({ meta }) => {
      const { key, link } = meta;
      const active = key === activeKey;

      return {
        key,
        children: active && (
          <Suspense fallback={<SuspenseFallBack />}>
            <Outlet />
          </Suspense>
        ),
        label: (
          <Link href={link.href} target={link.target} className={classNames(`${prefixUI}-nav`, { active })}>
            {icon && <FlexIcon icon={meta.icon} className={iconClassName} />}
            {meta.name}
          </Link>
        )
      };
    });
  }, [activeKey, match]);

  return render(
    <Tabs
      {...restProps}
      items={items}
      activeKey={activeKey}
      destroyInactiveTabPane
      className={classNames(namespace, className)}
    />
  );
});
