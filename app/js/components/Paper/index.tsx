/**
 * @module index
 */

import React, { memo } from 'react';

import classNames from 'classnames';
import useStyles, { prefixUI } from './style';

export interface PaperProps {
  className?: string;
  children?: React.ReactNode;
}

export default memo(function Paper({ className, children }: PaperProps): React.ReactElement {
  const [scope, render] = useStyles();

  return render(<div className={classNames(scope, prefixUI, className)}>{children}</div>);
});
