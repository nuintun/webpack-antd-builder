import React, { memo, useContext } from 'react';

import { ConfigProvider } from 'antd';
import { ConfigProviderProps } from 'antd/es/config-provider';

const { ConfigContext } = ConfigProvider;

export type { ConfigProviderProps };

export default memo(function Configure(props: ConfigProviderProps): React.ReactElement {
  const context = useContext(ConfigContext);

  return <ConfigProvider {...context} {...props} />;
});
