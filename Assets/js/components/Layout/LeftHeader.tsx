import React, { memo } from 'react';

import memoizeOne from 'memoize-one';
import Link from '/js/components/Link';
import { HeaderRenderProps } from '/js/components/SmartMenu';

import logo from '/images/logo.svg?url';

type Theme = HeaderRenderProps['theme'];
type GetLogoStyle = (collapsedWidth: number) => React.CSSProperties;
type GetLogoTitleStyle = (width: number, theme: Theme, collapsedWidth: number) => React.CSSProperties;

const getLogoStyle = memoizeOne<GetLogoStyle>(collapsedWidth => {
  return {
    padding: 8,
    verticalAlign: 'middle',
    maxWidth: collapsedWidth
  };
});

const getLogoTitleStyle = memoizeOne<GetLogoTitleStyle>((width, theme, collapsedWidth) => {
  return {
    fontSize: 24,
    marginLeft: 8,
    fontWeight: 700,
    verticalAlign: 'middle',
    maxWidth: width - collapsedWidth,
    color: theme === 'dark' ? '#fff' : '#000'
  };
});

export default memo(function LeftHeader({
  width,
  theme,
  collapsed,
  collapsedWidth = 64
}: HeaderRenderProps): React.ReactElement {
  if (collapsed) {
    return (
      <Link href="/" title="Home">
        <img src={logo} style={getLogoStyle(collapsedWidth)} />
      </Link>
    );
  }

  return (
    <Link href="/" title="Home">
      <img src={logo} style={getLogoStyle(collapsedWidth)} />
      <span style={getLogoTitleStyle(width, theme, collapsedWidth)}>Ant Design</span>
    </Link>
  );
});
