/**
 * @module Layout
 * @description 用户自定义业务模块
 */

import React, { memo, useMemo } from 'react';

import LeftHeader from './LeftHeader';
import RightHeader from './RightHeader';
import { Route } from '/js/utils/router';
import useTheme from '/js/hooks/useTheme';
import { Filter, parse } from '/js/utils/menus';
import { MenuType, Meta } from '/js/config/router';
import SmartLayout from '/js/components/SmartLayout';
import { HeaderRender } from '/js/components/SmartMenu';
import { Outlet, useOutletContext } from 'react-nest-router';

const leftHeaderRender: HeaderRender = props => <LeftHeader {...props} />;
const rightHeaderRender: HeaderRender = props => <RightHeader {...props} />;

export default memo(function Layout(): React.ReactElement {
  const [theme] = useTheme();
  const routes = useOutletContext<Route<Meta>[]>();

  const menus = useMemo(() => {
    return parse<Meta>(
      routes,
      ({ meta }) => {
        switch (meta.type) {
          case MenuType.Tabs:
            return Filter.Keep;
          case MenuType.Hidden:
            return Filter.Self;
          default:
            return Filter.None;
        }
      },
      (menu, { meta, children }) => {
        if (meta.type === MenuType.Tabs) {
          const tab = children?.[0];

          if (tab) {
            return {
              ...menu,
              link: {
                href: tab.meta.link.href,
                target: menu.link?.target
              }
            };
          }
        }

        return menu;
      }
    );
  }, [routes]);

  return (
    <SmartLayout
      theme={theme}
      menus={menus}
      siderWidth={256}
      leftHeaderRender={leftHeaderRender}
      rightHeaderRender={rightHeaderRender}
    >
      <Outlet />
    </SmartLayout>
  );
});
