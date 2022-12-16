/**
 * @module RouteBreadcrumb
 */

import React, { memo, useMemo } from 'react';

import classNames from 'classnames';
import Link from '/js/components/Link';
import useStyle, { prefixUI } from './style';
import FlexIcon from '/js/components/FlexIcon';
import { useMatches } from 'react-nest-router';
import { Icon, IRoute } from '/js/utils/router';
import { Breadcrumb, BreadcrumbProps } from 'antd';

const { Item } = Breadcrumb;

interface BreadcrumbItem {
  key: string;
  icon?: Icon;
  name: string;
  href?: string;
  active: boolean;
}

type BreadcrumbPicked = 'style' | 'className' | 'separator';

export interface RouteBreadcrumbProps extends Pick<BreadcrumbProps, BreadcrumbPicked> {
  icon?: boolean;
}

function getBreadcrumbs(matches: IRoute[]): BreadcrumbItem[] {
  const { length } = matches;
  const breadcrumbs: BreadcrumbItem[] = [];

  for (let i = 0; i < length; i++) {
    const match = matches[i];
    const { meta } = match;
    const { name } = meta;

    if (name) {
      const { children } = match;
      const { key, icon, link } = meta;

      if (i + 1 < length) {
        if (children?.some(route => route.index)) {
          breadcrumbs.push({ key, name, icon, href: link.href, active: false });
        } else {
          breadcrumbs.push({ key, name, icon, active: false });
        }
      } else {
        breadcrumbs.push({ key, name, icon, href: link.href, active: true });
      }
    }
  }

  return breadcrumbs;
}

export default memo(function RouteBreadcrumb({
  style,
  className,
  icon: showIcon = true
}: RouteBreadcrumbProps): React.ReactElement {
  const { render } = useStyle();
  const matches = useMatches() as IRoute[];
  const breadcrumbs = useMemo(() => getBreadcrumbs(matches), [matches]);

  return render(
    <Breadcrumb style={style} className={classNames('ui-component', prefixUI, className)}>
      {breadcrumbs.map(({ key, name, icon, href, active }) => (
        <Item key={key}>
          {href && !active ? (
            <Link href={href} className={`${prefixUI}-link`}>
              {showIcon && <FlexIcon icon={icon} className={`${prefixUI}-icon`} />}
              <span>{name}</span>
            </Link>
          ) : (
            <span className={classNames(`${prefixUI}-item`, { active })}>
              {showIcon && <FlexIcon icon={icon} className={`${prefixUI}-icon`} />}
              <span>{name}</span>
            </span>
          )}
        </Item>
      ))}
    </Breadcrumb>
  );
});
