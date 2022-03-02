import './index.less';

import React, { memo, useMemo } from 'react';

import { Breadcrumb } from 'antd';
import classNames from 'classnames';
import { isString } from '/js/utils/utils';
import { BreadcrumbItem as Item } from '/js/utils/router';
import { Link, RouteComponentProps } from 'react-router-dom';

type Breadcrumbs<T> = { [path: string]: Item<T> };
type BreadcrumbItem<T> = Item<T> & { active: boolean };

export interface SmartBreadcrumbProps<T> extends RouteComponentProps {
  breadcrumbs: Breadcrumbs<T>;
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

function getBreadcrumbItem<T>(item: Item<T>, active: boolean) {
  const { icon } = item;
  const breadcrumbItem = { ...item, active };

  if (icon) {
    breadcrumbItem.icon = iconRender(icon);
  }

  return breadcrumbItem;
}

function getBreadcrumbItems<T>(path: string, pathname: string, breadcrumbs: Breadcrumbs<T>): BreadcrumbItem<T>[] {
  const breadcrumbItems: BreadcrumbItem<T>[] = [];

  let active = true;
  let hasHome = false;
  let current = breadcrumbs[pathname] || breadcrumbs[path];

  while (current) {
    const { path, parent } = current;

    breadcrumbItems.push(getBreadcrumbItem(current, active));

    active = false;

    if (parent) {
      current = parent;
      break;
    } else {
      hasHome = path === '/';
    }
  }

  const home = breadcrumbs['/'];

  if (!hasHome && home) {
    breadcrumbItems.push(getBreadcrumbItem(home, active));
  }

  return breadcrumbItems.reverse();
}

function SmartBreadcrumb<T>({ match, location, breadcrumbs }: SmartBreadcrumbProps<T>): React.ReactElement {
  const breadcrumbItems = useMemo(() => {
    return getBreadcrumbItems(match.path, location.pathname, breadcrumbs);
  }, [match.path, location.pathname, breadcrumbs]);

  return (
    <Breadcrumb className="ui-breadcrumb">
      {breadcrumbItems.map(breadcrumbItem => (
        <Breadcrumb.Item key={breadcrumbItem.key}>
          {breadcrumbItem.href && !breadcrumbItem.active ? (
            <Link className="ui-breadcrumb-link" to={breadcrumbItem.href}>
              {breadcrumbItem.icon}
              <span>{breadcrumbItem.name}</span>
            </Link>
          ) : (
            <span className={classNames('ui-breadcrumb-item', { 'ui-breadcrumb-active': breadcrumbItem.active })}>
              {breadcrumbItem.icon}
              <span>{breadcrumbItem.name}</span>
            </span>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
}

export default memo(SmartBreadcrumb) as typeof SmartBreadcrumb;
