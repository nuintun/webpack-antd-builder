import './index.less';

import React, { memo, useMemo } from 'react';

import { Breadcrumb } from 'antd';
import classNames from 'classnames';
import Link from '/js/components/Link';
import { useMatches } from 'react-nest-router';
import { Icon, IRoute } from '/js/utils/router';
import SmartIcon from '/js/components/SmartMenu/SmartIcon';

const prefixUI = 'ui-smart-breadcrumb';
const iconClassName = `${prefixUI}-icon`;

interface BreadcrumbItem {
  key: string;
  icon?: Icon;
  name: string;
  href?: string;
  active: boolean;
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
        if (children && children.some(route => route.index)) {
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

export default memo(function SmartBreadcrumb(): React.ReactElement {
  const matches = useMatches() as IRoute[];

  const breadcrumbs = useMemo(() => {
    return getBreadcrumbs(matches);
  }, [matches]);

  return (
    <Breadcrumb className={prefixUI}>
      {breadcrumbs.map(({ key, name, icon, href, active }) => (
        <Breadcrumb.Item key={key}>
          {href && !active ? (
            <Link className={`${prefixUI}-link`} href={href}>
              <SmartIcon icon={icon} className={iconClassName} />
              <span>{name}</span>
            </Link>
          ) : (
            <span className={classNames(`${prefixUI}-item`, { active })}>
              <SmartIcon icon={icon} className={iconClassName} />
              <span>{name}</span>
            </span>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
});
