/**
 * @module Layout
 * @description 用户自定义业务模块
 */

import { memo } from 'react';
import { MenuItem } from '/js/utils/router';
import SmartLayout from '/js/components/SmartLayout';
import { Outlet, useOutletContext } from 'react-nest-router';

interface LayoutOutletContext {
  menus: MenuItem[];
}

export default memo(function Layout() {
  const { menus } = useOutletContext<LayoutOutletContext>();

  return (
    <SmartLayout menus={menus}>
      <Outlet />
    </SmartLayout>
  );
});
