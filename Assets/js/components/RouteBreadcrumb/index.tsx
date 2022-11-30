/**
 * @module RouteBreadcrumb
 */

import React, { memo, useMemo } from 'react';

import classNames from 'classnames';
import Link from '/js/components/Link';
import FlexIcon from '/js/components/FlexIcon';
import { useMatches } from 'react-nest-router';
import { Icon, IRoute } from '/js/utils/router';
import { Breadcrumb, BreadcrumbProps } from 'antd';
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

  const render = useStyleSheets(['components', 'RouteBreadcrumb'], token => {
    const { colorPrimary, fontSizeHeading2 } = token;

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
          msScrollChaining: 'none',
          OverscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          padding: `0 ${token.paddingXS}px`,
          backgroundColor: token.colorBgContainer,
          lineHeight: `${fontSizeHeading2 - token.lineWidth}px`,
          borderBlockEnd: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,

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
              color: colorPrimary
            }
          },

          [`.${prefixUI}-link`]: {
            cursor: 'pointer',

            '&:hover': {
              color: colorPrimary
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
