/**
 * @module useItems
 */

import React, { useMemo } from 'react';

import { MenuProps } from 'antd';
import Link from '/js/components/Link';
import { DFSTree } from '/js/utils/tree';
import { isString } from '/js/utils/utils';
import { MenuItem } from '/js/utils/router';
import { prefixUI } from './SmartMenuUtils';

const iconClassName = `${prefixUI}-icon`;
const titleClassName = `${prefixUI}-title`;

export type ItemRender = (menu: MenuItem) => React.ReactNode;
export type Item = NonNullable<NonNullable<MenuProps['items']>[0]>;

function renderIcon(icon?: string | React.ReactElement): React.ReactElement | undefined {
  if (icon) {
    if (isString(icon)) {
      return (
        <span className={`anticon ${iconClassName}`}>
          <img src={icon} alt="icon" />
        </span>
      );
    }

    return React.cloneElement(icon, { className: iconClassName });
  }
}

function renderItem(item: MenuItem, itemRender?: ItemRender) {
  if (itemRender) {
    return itemRender(item);
  }

  const { icon, name } = item;

  return (
    <>
      {renderIcon(icon)}
      <span>{name}</span>
    </>
  );
}

function renderLabel(item: MenuItem, selectedKeys: string[], itemRender?: ItemRender): React.ReactElement {
  const { children } = item;

  if (children && children.length > 0) {
    return <span className={titleClassName}>{renderItem(item, itemRender)}</span>;
  } else {
    const { key, link } = item;
    const { href, target } = link;
    const replace = selectedKeys.includes(key);

    return (
      <Link href={href} className={titleClassName} replace={replace} target={target}>
        {renderItem(item, itemRender)}
      </Link>
    );
  }
}

export default function useItems(items: MenuItem[], selectedKeys: string[], itemRender?: ItemRender): Item[] {
  return useMemo(() => {
    const menus: Item[] = [];
    const flatMenus: Record<string, Item[]> = {};

    for (const item of items) {
      const tree = new DFSTree(item, item => item.children);

      for (const [current, parent] of tree) {
        let item: Item;

        const { key, name, children } = current;
        const hasChildren = children && children.length > 0;

        if (hasChildren) {
          item = {
            key,
            children: (flatMenus[key] = children),
            label: renderLabel(current, selectedKeys, itemRender)
          };
        } else {
          item = {
            key,
            title: name,
            label: renderLabel(current, selectedKeys, itemRender)
          };
        }

        if (parent) {
          flatMenus[parent.key].push(item);
        } else {
          menus.push(item);
        }
      }
    }

    return menus;
  }, items);
}
