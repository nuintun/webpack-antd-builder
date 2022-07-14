/**
 * @module Layout
 * @description 用户自定义业务模块
 */

import { memo, useMemo } from 'react';

import LeftHeader from './LeftHeader';
import RightHeader from './RightHeader';
import { Route } from '/js/utils/router';
import { Meta } from '/js/config/router';
import useTheme from '/js/hooks/useTheme';
import { Filter, parse } from '/js/utils/menus';
import SmartLayout from '/js/components/SmartLayout';
import { HeaderRender } from '/js/components/SmartMenu';
import { Outlet, useOutletContext } from 'react-nest-router';

const leftHeaderRender: HeaderRender = props => <LeftHeader {...props} />;
const rightHeaderRender: HeaderRender = props => <RightHeader {...props} />;

export default memo(function Layout() {
  const [theme] = useTheme();
  const routes = useOutletContext<Route<Meta>[]>();

  const menus = useMemo(() => {
    return parse<Meta>(
      routes,
      ({ meta }) => {
        if (meta.tabs) return Filter.Keep;

        return meta.hideInMenu ? Filter.Self : Filter.None;
      },
      (menu, route) => {
        if (route.meta.tabs) {
          const first = route.children?.[0];

          if (first) return { ...menu, link: { href: first.meta.link.href } };
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
