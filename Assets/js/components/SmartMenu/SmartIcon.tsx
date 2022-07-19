import React, { cloneElement, memo } from 'react';

import classNames from 'classnames';
import { Icon } from '/js/utils/router';
import { isString } from '/js/utils/utils';

export interface SmartIconProps {
  icon?: Icon;
  className?: string;
}

export default memo(function SmartIcon({ className, icon }: SmartIconProps): React.ReactElement | null {
  if (icon) {
    if (isString(icon)) {
      return (
        <span className={classNames('anticon', className)}>
          <img src={icon} alt="icon" />
        </span>
      );
    }

    return cloneElement(icon, { className });
  }

  return null;
});
