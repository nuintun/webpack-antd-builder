/**
 * @module Logo
 */

import clsx from 'clsx';
import { memo } from 'react';
import Link from '/js/components/Link';
import { RenderHeaderProps } from '/js/components/FlexMenu';
import useStyles, { prefixCls } from '/js/components/Layout/style/logo';

import logo from '/images/logo.svg?url';

export default memo(function LogoHeader({ collapsed }: RenderHeaderProps) {
  const scope = useStyles();

  return (
    <Link to="/" title="Home" className={clsx(scope, prefixCls)}>
      <img alt="logo" src={logo} />
      {!collapsed && <span>{__APP_NAME__}</span>}
    </Link>
  );
});
