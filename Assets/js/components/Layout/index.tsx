/**
 * @module Layout
 * @description 用户自定义业务模块
 */

import { memo } from 'react';

import LeftHeader from './LeftHeader';
import RightHeader from './RightHeader';
import useTheme from '/js/hooks/useTheme';
import { MenuItem } from '/js/utils/router';
import SmartLayout from '/js/components/SmartLayout';
import { HeaderRender } from '/js/components/SmartMenu';
import { Outlet, useOutletContext } from 'react-nest-router';

interface LayoutOutletContext {
  menus: MenuItem[];
}

const leftHeaderRender: HeaderRender = props => <LeftHeader {...props} />;
const rightHeaderRender: HeaderRender = props => <RightHeader {...props} />;

export default memo(function Layout() {
  const [theme] = useTheme();
  const { menus } = useOutletContext<LayoutOutletContext>();

  return (
    <SmartLayout
      theme={theme}
      menus={menus}
      siderWith={208}
      leftHeaderRender={leftHeaderRender}
      rightHeaderRender={rightHeaderRender}
    >
      <Outlet />
    </SmartLayout>
  );
});
