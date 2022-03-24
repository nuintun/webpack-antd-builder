/**
 * @module Layout
 * @description 用户自定义业务模块
 */

import { memo } from 'react';
import { Outlet } from 'react-nest-router';

export default memo(function Layout() {
  return <Outlet />;
});
