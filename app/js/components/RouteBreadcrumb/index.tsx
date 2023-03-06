/**
 * @module RouteBreadcrumb
 */

import React, { memo, useMemo } from 'react';

import classNames from 'classnames';
import Link from '/js/components/Link';
import { IRoute } from '/js/utils/router';
import useStyle, { prefixUI } from './style';
import FlexIcon from '/js/components/FlexIcon';
import { useMatches } from 'react-nest-router';
import { Breadcrumb, BreadcrumbProps } from 'antd';

interface BreadcrumbItem {
  title: React.ReactNode;
}

type BreadcrumbPicked = 'style' | 'className' | 'separator';

export interface RouteBreadcrumbProps extends Pick<BreadcrumbProps, BreadcrumbPicked> {
  icon?: boolean;
}

function getBreadcrumbItems(matches: IRoute[], showIcon: boolean): BreadcrumbItem[] {
  const { length } = matches;
  const items: BreadcrumbItem[] = [];

  for (let i = 0; i < length; i++) {
    const match = matches[i];
    const { meta } = match;
    const { name } = meta;

    if (name) {
      const { children } = match;
      const { icon, link } = meta;
      const active = i + 1 >= length;
      const isLink = !active && children?.some(route => route.index);

      if (isLink) {
        items.push({
          title: (
            <Link href={link.href} target={link.target} className={`${prefixUI}-link`}>
              {showIcon && <FlexIcon icon={icon} className={`${prefixUI}-icon`} />}
              <span>{name}</span>
            </Link>
          )
        });
      } else {
        items.push({
          title: (
            <span className={classNames(`${prefixUI}-item`, { active })}>
              {showIcon && <FlexIcon icon={icon} className={`${prefixUI}-icon`} />}
              <span>{name}</span>
            </span>
          )
        });
      }
    }
  }

  return items;
}

export default memo(function RouteBreadcrumb({
  style,
  className,
  icon: showIcon = true
}: RouteBreadcrumbProps): React.ReactElement {
  const { render } = useStyle();
  const matches = useMatches() as IRoute[];
  const items = useMemo(() => getBreadcrumbItems(matches, showIcon), [matches, showIcon]);

  return render(<Breadcrumb items={items} style={style} className={classNames('ui-component', prefixUI, className)} />);
});
