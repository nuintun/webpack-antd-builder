import React, { memo, useMemo } from 'react';

import { Meta } from '/js/utils/router';
import zhCN from 'antd/es/locale/zh_CN';
import useTitle from '/js/hooks/useTitle';
import Configure from '/js/components/Configure';
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
    <Configure virtual locale={zhCN}>
      <Outlet />
    </Configure>
  );
});
