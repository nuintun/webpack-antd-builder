/**
 * @module index
 */

import clsx from 'clsx';
import { Icon } from '/js/utils/router';
import { isString } from '/js/utils/utils';
import { cloneElement, memo, use } from 'react';
import { ConfigContext } from 'antd/es/config-provider';

export interface FlexIconProps {
  icon?: Icon;
  className?: string;
}

export default memo(function FlexIcon({ className, icon }: FlexIconProps) {
  const { iconPrefixCls } = use(ConfigContext);

  if (icon) {
    if (isString(icon)) {
      return (
        <span className={clsx(iconPrefixCls, className)}>
          <img src={icon} alt="icon" />
        </span>
      );
    }

    return cloneElement(icon, { className });
  }

  return null;
});
