import React, { memo, useMemo } from 'react';

import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { Meta } from '/js/utils/router';
import useTitle from '/js/hooks/useTitle';
import { Outlet, useMatches } from 'react-nest-router';

export default memo(function Document(): React.ReactElement {
  const matches = useMatches<Meta>();
  const title = useMemo(() => {
    let index = matches.length;

    while (--index >= 0) {
      const { meta } = matches[index];

      if (meta && meta.name) return meta.name;
    }

    return '404';
  }, [matches]);

  useTitle(title);

  return (
    <ConfigProvider virtual locale={zhCN}>
      <Outlet />
    </ConfigProvider>
  );
});
