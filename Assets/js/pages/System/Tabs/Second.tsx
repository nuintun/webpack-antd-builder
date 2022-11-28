import { memo } from 'react';

import RouteBreadcrumb from '/js/components/RouteBreadcrumb';

export default memo(function Page() {
  return (
    <>
      <RouteBreadcrumb />
      <p>标签页二内容</p>
    </>
  );
});
