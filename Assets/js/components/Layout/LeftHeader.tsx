import React, { memo, useMemo } from 'react';

import Link from '/js/components/Link';
import { HeaderRenderProps } from '/js/components/SmartMenu';

import logo from '/images/logo.svg?url';

type Theme = HeaderRenderProps['theme'];

export default memo(function LeftHeader({ theme, collapsed }: HeaderRenderProps): React.ReactElement {
  const style = useMemo<React.CSSProperties>(() => {
    return {
      fontSize: 0
    };
  }, []);

  const logoStyle = useMemo<React.CSSProperties>(() => {
    return {
      width: 64,
      padding: 8,
      aspectRatio: '1 / 1',
      verticalAlign: 'middle'
    };
  }, []);

  const titleStyle = useMemo<React.CSSProperties>(() => {
    return {
      fontSize: 24,
      fontWeight: 700,
      verticalAlign: 'middle',
      color: theme === 'dark' ? '#fff' : '#000'
    };
  }, [theme]);

  return (
    <Link href="/" title="Home" style={style}>
      <img alt="logo" src={logo} style={logoStyle} />
      {!collapsed && <span style={titleStyle}>Ant Design</span>}
    </Link>
  );
});
