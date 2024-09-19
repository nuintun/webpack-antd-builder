/**
 * @module index
 */

import React, { memo } from 'react';
import classNames from 'classnames';
import useStyles, { prefixCls } from './style';

export interface PaperProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export default memo(function Paper({ style, className, children }: PaperProps) {
  const [scope, render] = useStyles();

  return render(
    <div style={style} className={classNames(scope, prefixCls, className)}>
      {children}
    </div>
  );
});
