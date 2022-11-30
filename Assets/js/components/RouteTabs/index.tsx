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

export default memo(function RouteTabs({ className, icon: showIcon = true, ...restProps }: RouteTabsProps): React.ReactElement {
  const index = useMatchIndex();
  const match = useMatch() as IRoute<Meta>;
  const matches = useMatches() as IRoute<Meta>[];
  const activeKey = useMemo(() => matches[index + 1]?.meta.key, [matches, index]);

  const render = useStyleSheets(['components', 'RouteTabs'], token => {
    const { fontSizeLG } = token;

    return {
      '.ui-component': {
        [`&.${prefixUI}`]: {
          backgroundColor: token.colorBgContainer,

          '> div': {
            margin: 0,
            padding: 0,

            '&:first-child': {
              padding: `0 ${token.paddingXS}px`
            }
          },

          [`.${prefixUI}-nav`]: {
            fontSize: fontSizeLG,
            color: token.colorLink,
            lineHeight: `${fontSizeLG}px`,

            '&.active': {
              color: token.colorLinkActive
            },

            [`.${prefixUI}-icon`]: {
              margin: 'unset',
              marginInlineEnd: token.marginXXS,

              '> img': {
                width: 'auto',
                height: fontSizeLG
              }
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
            {showIcon && <FlexIcon icon={meta.icon} className={`${prefixUI}-icon`} />}
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
      className={classNames('ui-component', prefixUI, className)}
    />
  );
});
