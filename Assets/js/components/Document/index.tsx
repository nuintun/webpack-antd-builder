import React, { memo, useMemo } from 'react';

import { ConfigProvider } from 'antd';
import { Meta } from '/js/utils/router';
import zhCN from 'antd/es/locale/zh_CN';
import useTitle from '/js/hooks/useTitle';
import { Outlet, useMatches } from 'react-nest-router';

export default memo(function Document(): React.ReactElement {
  const matches = useMatches<Meta>();
  const title = useMemo(() => {
    const lastIndex = matches.length - 1;

    return matches[lastIndex]?.meta?.name || '404';
  }, [matches]);

  useTitle(title);

  return (
    <ConfigProvider locale={zhCN}>
      <Outlet />
    </ConfigProvider>
  );
});
