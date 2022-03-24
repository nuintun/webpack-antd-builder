/**
 * @module Layout
 * @description 用户自定义业务模块
 */

import { memo } from 'react';
import LeftHeader from './LeftHeader';
import { MenuItem } from '/js/utils/router';
import SmartLayout from '/js/components/SmartLayout';
import { HeaderRender } from '/js/components/SmartMenu';
import { Outlet, useOutletContext } from 'react-nest-router';

interface LayoutOutletContext {
  menus: MenuItem[];
}

const leftHeaderRender: HeaderRender = props => <LeftHeader {...props} />;

export default memo(function Layout() {
  const { menus } = useOutletContext<LayoutOutletContext>();

  return (
    <SmartLayout menus={menus} theme="light" leftHeaderRender={leftHeaderRender}>
      <Outlet />
    </SmartLayout>
  );
});
