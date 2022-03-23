/**
 * @module Layout
 */

import { memo } from 'react';
import { Outlet } from 'react-nest-router';

export default memo(function Layout() {
  return <Outlet />;
});
