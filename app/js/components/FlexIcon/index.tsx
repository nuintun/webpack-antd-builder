/**
 * @module index
 */

import classNames from 'classnames';
import { ConfigProvider } from 'antd';
import { Icon } from '/js/utils/router';
import { isString } from '/js/utils/utils';
import { cloneElement, memo, useContext } from 'react';

export interface FlexIconProps {
  icon?: Icon;
  className?: string;
}

const { ConfigContext } = ConfigProvider;

export default memo(function FlexIcon({ className, icon }: FlexIconProps) {
  const { iconPrefixCls } = useContext(ConfigContext);

  if (icon) {
    if (isString(icon)) {
      return (
        <span className={classNames(iconPrefixCls, className)}>
          <img src={icon} alt="icon" />
        </span>
      );
    }

    return cloneElement(icon, { className });
  }

  return null;
});
