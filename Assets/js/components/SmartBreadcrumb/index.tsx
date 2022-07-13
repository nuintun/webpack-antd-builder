import './index.less';

import React, { memo, useMemo } from 'react';

import { Breadcrumb } from 'antd';
import classNames from 'classnames';
import Link from '/js/components/Link';
import { IRoute } from '/js/utils/router';
import { isString } from '/js/utils/utils';
import { useMatches } from 'react-nest-router';

interface BreadcrumbItem {
  key: string;
  name: string;
  href?: string;
  active: boolean;
  icon?: React.ReactElement | undefined;
}

function iconRender(icon?: string | React.ReactElement): React.ReactElement | undefined {
  if (isString(icon)) {
    return (
      <span className="anticon">
        <img src={icon} alt="icon" />
      </span>
    );
  }

  return icon;
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
      const { key, link } = meta;
      const icon = iconRender(meta.icon);

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
    <Breadcrumb className="ui-breadcrumb">
      {breadcrumbs.map(({ key, name, icon, href, active }) => (
        <Breadcrumb.Item key={key}>
          {href && !active ? (
            <Link className="ui-breadcrumb-link" href={href}>
              {iconRender(icon)}
              <span>{name}</span>
            </Link>
          ) : (
            <span className={classNames('ui-breadcrumb-item', { 'ui-breadcrumb-active': active })}>
              {iconRender(icon)}
              <span>{name}</span>
            </span>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
});
