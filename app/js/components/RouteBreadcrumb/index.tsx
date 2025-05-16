/**
 * @module index
 */

import classNames from 'classnames';
import Link from '/js/components/Link';
import { IRoute } from '/js/utils/router';
import React, { memo, useMemo } from 'react';
import FlexIcon from '/js/components/FlexIcon';
import useStyles, { prefixCls } from './style';
import { useMatches } from 'react-nest-router';
import { Breadcrumb, BreadcrumbProps, GetProp } from 'antd';

type BreadcrumbItem = GetProp<BreadcrumbProps, 'items'>[0];

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
      const isLinkable = !active && children?.some(route => route.index || route.reachable);

      if (isLinkable) {
        items.push({
          title: (
            <Link href={link.href} target={link.target} className={`${prefixCls}-link`}>
              {showIcon && <FlexIcon icon={icon} className={`${prefixCls}-icon`} />}
              <span>{name}</span>
            </Link>
          )
        });
      } else {
        items.push({
          title: (
            <span className={classNames(`${prefixCls}-item`, { active })}>
              {showIcon && <FlexIcon icon={icon} className={`${prefixCls}-icon`} />}
              <span>{name}</span>
            </span>
          )
        });
      }
    }
  }

  return items;
}

export default memo(function RouteBreadcrumb({ style, className, icon: showIcon = true }: RouteBreadcrumbProps) {
  const [scope, render] = useStyles();
  const matches = useMatches() as IRoute[];
  const items = useMemo(() => getBreadcrumbItems(matches, showIcon), [matches, showIcon]);

  return render(<Breadcrumb items={items} style={style} className={classNames(scope, prefixCls, className)} />);
});
