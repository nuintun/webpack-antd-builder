import './index.less';

import React, { memo } from 'react';

import { Breadcrumb } from 'antd';
import classNames from 'classnames';
import memoizeOne from 'memoize-one';
import { isString, urlToPaths } from '~js/utils/utils';
import { Link, RouteComponentProps } from 'react-router-dom';
import { BreadcrumbItem as Item } from '~js/utils/parseRouter';

type Match = RouteComponentProps['match'];
type Location = RouteComponentProps['location'];

type Breadcrumbs<T> = { [path: string]: Item<T> };
type BreadcrumbItem<T> = Item<T> & { current: boolean };

export interface SmartBreadcrumbProps<T> extends RouteComponentProps {
  breadcrumbs: Breadcrumbs<T>;
}

function iconRender(icon?: string | React.ReactElement): React.ReactElement | undefined {
  if (icon) {
    if (isString(icon)) {
      return (
        <span className="anticon">
          <img src={icon} alt="icon" />
        </span>
      );
    }

    return icon;
  }
}

const getBreadcrumbItems = memoizeOne(function <T>(
  match: Match,
  location: Location,
  breadcrumbs: Breadcrumbs<T>
): BreadcrumbItem<T>[] {
  const { pathname } = location;
  const unique: { [path: string]: true } = {};
  const breadcrumbItems: BreadcrumbItem<T>[] = [];
  const paths = ['/', ...urlToPaths(match.path.toLowerCase()), pathname];

  for (const path of paths) {
    if (!unique[path]) {
      unique[path] = true;

      const breadcrumbItem = breadcrumbs[path];

      if (breadcrumbItem) {
        const { href, icon } = breadcrumbItem;

        breadcrumbItems.push({
          ...breadcrumbItem,
          icon: iconRender(icon),
          current: pathname === path || pathname === href
        });
      }
    }
  }

  return breadcrumbItems;
});

function SmartBreadcrumb<T>({ match, location, breadcrumbs }: SmartBreadcrumbProps<T>): React.ReactElement {
  const breadcrumbItems = getBreadcrumbItems(match, location, breadcrumbs);

  return (
    <Breadcrumb className="ui-breadcrumb">
      {breadcrumbItems.map(breadcrumbItem => (
        <Breadcrumb.Item key={breadcrumbItem.key}>
          {breadcrumbItem.href && !breadcrumbItem.current ? (
            <Link className="ui-breadcrumb-link" to={breadcrumbItem.href}>
              {breadcrumbItem.icon}
              <span>{breadcrumbItem.name}</span>
            </Link>
          ) : (
            <span className={classNames('ui-breadcrumb-item', { 'ui-breadcrumb-current': breadcrumbItem.current })}>
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
