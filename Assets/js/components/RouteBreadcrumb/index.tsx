/**
 * @module RouteBreadcrumb
 */

import React, { memo, useMemo } from 'react';

import { Breadcrumb, BreadcrumbProps } from 'antd';
import classNames from 'classnames';
import Link from '/js/components/Link';
import FlexIcon from '/js/components/FlexIcon';
import { useMatches } from 'react-nest-router';
import { Icon, IRoute } from '/js/utils/router';
import { useStyleSheets } from '/js/hooks/useStyleSheets';

const { Item } = Breadcrumb;

const prefixUI = 'ui-route-breadcrumb';

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

export default memo(function RouteBreadcrumb({
  style,
  className,
  icon: showIcon = true
}: RouteBreadcrumbProps): React.ReactElement {
  const matches = useMatches() as IRoute[];

  const breadcrumbs = useMemo(() => {
    return getBreadcrumbs(matches);
  }, [matches]);

  const render = useStyleSheets(prefixUI, token => {
    const { fontSizeHeading2 } = token;

    return {
      '.ui-component': {
        [`&.${prefixUI}`]: {
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          color: token.colorText,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          fontSize: token.fontSize,
          height: fontSizeHeading2,
          WebkitOverflowScrolling: 'touch',
          lineHeight: `${fontSizeHeading2}px`,
          backgroundColor: token.colorBgContainer,
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          [`.${prefixUI}-link, .${prefixUI}-item`]: {
            cursor: 'default',
            [`.${prefixUI}-icon`]: {
              marginInlineEnd: token.marginXXS,
              '> img': {
                width: 'auto',
                height: fontSizeHeading2
              }
            },
            '&.active': {
              color: token.colorPrimary
            }
          },
          [`.${prefixUI}-link`]: {
            cursor: 'pointer',
            '&:hover': {
              color: token.colorPrimary
            }
          }
        }
      }
    };
  });

  return render(
    <Breadcrumb style={style} className={classNames('ui-component', prefixUI, className)}>
      {breadcrumbs.map(({ key, name, icon, href, active }) => (
        <Item key={key}>
          {href && !active ? (
            <Link className={`${prefixUI}-link`} href={href}>
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
