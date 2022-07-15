/**
 * @module useItems
 */

import React, { cloneElement, useMemo } from 'react';

import { MenuProps } from 'antd';
import Link from '/js/components/Link';
import { DFSTree } from '/js/utils/tree';
import { isString } from '/js/utils/utils';
import { MenuItem } from '/js/utils/menus';
import { prefixUI } from './SmartMenuUtils';

const iconClassName = `${prefixUI}-icon`;
const titleClassName = `${prefixUI}-title`;

export type ItemRender = (item: MenuItem) => React.ReactNode;
export type Item = NonNullable<NonNullable<MenuProps['items']>[0]>;

function renderIcon(icon?: string | React.ReactElement): React.ReactNode {
  if (icon) {
    if (isString(icon)) {
      return (
        <span className={`anticon ${iconClassName}`}>
          <img src={icon} alt="icon" />
        </span>
      );
    }

    return cloneElement(icon, { className: iconClassName });
  }
}

function renderItem(item: MenuItem, itemRender?: ItemRender): React.ReactNode {
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
  const { link, children } = item;

  if ((children && children.length > 0) || !link) {
    return <span className={titleClassName}>{renderItem(item, itemRender)}</span>;
  } else {
    const { key } = item;
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
    const result: Item[] = [];
    const itemMapping: Record<string, Item[]> = {};

    for (const item of items) {
      const tree = new DFSTree(item, item => item.children);

      for (const [current, parent] of tree) {
        let item: Item;

        const { key, name, children } = current;
        const hasChildren = children && children.length > 0;

        if (hasChildren) {
          item = {
            key,
            children: (itemMapping[key] = []),
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
          itemMapping[parent.key].push(item);
        } else {
          result.push(item);
        }
      }
    }

    return result;
  }, [selectedKeys, items, itemRender]);
}
