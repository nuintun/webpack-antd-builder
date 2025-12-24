/**
 * @module index
 */

import clsx from 'clsx';
import React, { memo } from 'react';
import useStyles, { prefixCls } from './style';

export interface PaperProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export default memo(function Paper({ style, className, children }: PaperProps) {
  const scope = useStyles();

  return (
    <div style={style} className={clsx(scope, prefixCls, className)}>
      {children}
    </div>
  );
});
