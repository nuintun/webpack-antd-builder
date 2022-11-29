import React, { memo, useMemo } from 'react';

import Link from '/js/components/Link';
import { HeaderRenderProps } from '/js/components/FlexMenu';

import logo from '/images/logo.svg?url';

export default memo(function LeftHeader({ collapsed }: HeaderRenderProps): React.ReactElement {
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
      verticalAlign: 'middle'
    };
  }, []);

  return (
    <Link href="/" title="Home" style={style}>
      <img alt="logo" src={logo} style={logoStyle} />
      {!collapsed && <span style={titleStyle}>Ant Design</span>}
    </Link>
  );
});
