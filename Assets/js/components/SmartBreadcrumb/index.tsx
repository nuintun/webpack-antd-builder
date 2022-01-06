import './index.less';

import React, { memo, useMemo } from 'react';

import { Breadcrumb } from 'antd';
import classNames from 'classnames';
import { Link, RouteComponentProps } from 'react-router-dom';
import { BreadcrumbItem as Item } from '~js/utils/parseRouter';
import { isString, isUndef, pathToPaths } from '~js/utils/utils';

type Breadcrumbs<T> = { [path: string]: Item<T> };
type BreadcrumbItem<T> = Item<T> & { current: boolean };

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

function getBreadcrumbItems<T>(route: string, pathname: string, breadcrumbs: Breadcrumbs<T>): BreadcrumbItem<T>[] {
  const unique: { [path: string]: true } = {};
  const breadcrumbItems: BreadcrumbItem<T>[] = [];
  const paths = ['/', ...pathToPaths(route), pathname];

  for (const path of paths) {
    if (!unique[path]) {
      unique[path] = true;

      const breadcrumb = breadcrumbs[path];

      if (breadcrumb) {
        const breadcrumbItem = {
          ...breadcrumb,
          current: path === pathname
        };

        const { icon } = breadcrumb;

        if (!isUndef(icon)) {
          breadcrumbItem.icon = iconRender(icon);
        }

        breadcrumbItems.push(breadcrumbItem);
      }
    }
  }

  return breadcrumbItems;
}

function SmartBreadcrumb<T>({ match, location, breadcrumbs }: SmartBreadcrumbProps<T>): React.ReactElement {
  const breadcrumbItems = useMemo(() => {
    return getBreadcrumbItems(match.path, location.pathname, breadcrumbs);
  }, [match.path, location.pathname, breadcrumbs]);

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
