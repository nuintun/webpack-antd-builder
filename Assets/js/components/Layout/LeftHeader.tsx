import React, { memo } from 'react';

import memoizeOne from 'memoize-one';
import Link from '/js/components/Link';
import { HeaderRenderProps } from '/js/components/SmartMenu';

import logo from '/images/logo.svg?url';

type Theme = HeaderRenderProps['theme'];
type GetLogoStyle = () => React.CSSProperties;
type GetLogoTitleStyle = (theme: Theme) => React.CSSProperties;

const getLogoStyle = memoizeOne<GetLogoStyle>(() => {
  return {
    width: 64,
    padding: 8,
    aspectRatio: '1 / 1',
    verticalAlign: 'middle'
  };
});

const getLogoTitleStyle = memoizeOne<GetLogoTitleStyle>(theme => {
  return {
    fontSize: 24,
    fontWeight: 700,
    verticalAlign: 'middle',
    color: theme === 'dark' ? '#fff' : '#000'
  };
});

export default memo(function LeftHeader({ theme, collapsed }: HeaderRenderProps): React.ReactElement {
  return (
    <Link href="/" title="Home">
      <img alt="logo" src={logo} style={getLogoStyle()} />
      {!collapsed && <span style={getLogoTitleStyle(theme)}>Ant Design</span>}
    </Link>
  );
});
