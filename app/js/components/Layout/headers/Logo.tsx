/**
 * @module LogoHeader
 */

import Link from '/js/components/Link';
import React, { memo, useMemo } from 'react';
import useStyles, { prefixUI } from './style/logo';
import { RenderHeaderProps } from '/js/components/FlexMenu';

import logo from '/images/logo.svg?url';
import classNames from 'classnames';

export default memo(function LogoHeader({ collapsed }: RenderHeaderProps): React.ReactElement {
  const [scope, render] = useStyles();

  return render(
    <Link href="/" title="Home" className={classNames(scope, prefixUI)}>
      <img alt="logo" src={logo} />
      {!collapsed && <span>{__APP_NAME__}</span>}
    </Link>
  );
});
