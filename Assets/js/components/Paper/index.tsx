import React, { memo } from 'react';

import classNames from 'classnames';
import useStyle, { prefixUI } from './style';

export interface PaperProps {
  className?: string;
  children?: React.ReactNode;
}

export default memo(function RouteTabs({ className, children }: PaperProps): React.ReactElement {
  const render = useStyle();

  return render(<div className={classNames(prefixUI, className)}>{children}</div>);
});
