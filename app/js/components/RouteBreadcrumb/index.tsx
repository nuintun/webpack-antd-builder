/**
 * @module index
 */

import clsx from 'clsx';
import Link from '/js/components/Link';
import { IRoute } from '/js/utils/router';
import React, { memo, useMemo } from 'react';
import FlexIcon from '/js/components/FlexIcon';
import useStyles, { prefixCls } from './style';
import { useMatches } from 'react-nest-router';
import { Breadcrumb, BreadcrumbProps, GetProp } from 'antd';

type BreadcrumbItems = GetProp<BreadcrumbProps, 'items'>;

type BreadcrumbPicked = 'style' | 'className' | 'separator';

export interface RouteBreadcrumbProps extends Pick<BreadcrumbProps, BreadcrumbPicked> {
  icon?: boolean;
}

function getBreadcrumbItems(matches: IRoute[], showIcon: boolean): BreadcrumbItems {
  const { length } = matches;
  const items: BreadcrumbItems = [];

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
            <Link to={link.href} target={link.target} className={`${prefixCls}-link`}>
              {showIcon && <FlexIcon icon={icon} className={`${prefixCls}-icon`} />}
              <span>{name}</span>
            </Link>
          )
        });
      } else {
        items.push({
          title: (
            <span className={clsx(`${prefixCls}-item`, { active })}>
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
  const scope = useStyles();
  const matches = useMatches() as IRoute[];
  const items = useMemo(() => getBreadcrumbItems(matches, showIcon), [matches, showIcon]);

  return <Breadcrumb items={items} style={style} className={clsx(scope, prefixCls, className)} />;
});
