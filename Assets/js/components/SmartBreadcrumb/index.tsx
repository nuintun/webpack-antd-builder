import './index.less';

import React, { memo } from 'react';

import { Breadcrumb } from 'antd';
import classNames from 'classnames';
import memoizeOne from 'memoize-one';
import { isString, urlToPaths } from '~js/utils/utils';
import { BreadcrumbItem as Item } from '~js/utils/getRouter';
import { Link, RouteComponentProps } from 'react-router-dom';

type Match = RouteComponentProps['match'];
type Location = RouteComponentProps['location'];

type Breadcrumbs = { [path: string]: Item };
type BreadcrumbItem = Item & { current: boolean };

export interface SmartBreadcrumbProps extends RouteComponentProps {
  breadcrumbs: Breadcrumbs;
}

function iconRender(icon?: string | React.ReactElement): React.ReactElement | null {
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

  return null;
}

const getBreadcrumbItems = memoizeOne((match: Match, location: Location, breadcrumbs: Breadcrumbs): BreadcrumbItem[] => {
  const { pathname } = location;
  const unique: { [path: string]: true } = {};
  const breadcrumbItems: BreadcrumbItem[] = [];
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
        } as BreadcrumbItem);
      }
    }
  }

  return breadcrumbItems;
});

export default memo(function SmartBreadcrumb({ match, location, breadcrumbs }: SmartBreadcrumbProps): React.ReactElement {
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
});
