import { memo } from 'react';

import RouteBreadcrumb from '/js/components/RouteBreadcrumb';

export default memo(function Page() {
  return (
    <>
      <RouteBreadcrumb />
      <p>标签页一内容</p>
    </>
  );
});
