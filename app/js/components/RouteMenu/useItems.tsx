/**
 * @module useItems
 */

import React, { useMemo } from 'react';

import { MenuProps } from 'antd';
import { prefixUI } from './style';
import Link from '/js/components/Link';
import { DFSTree } from '/js/utils/tree';
import { MenuItem } from '/js/utils/menus';
import FlexIcon from '/js/components/FlexIcon';

export type ItemRender = (item: MenuItem) => React.ReactNode;
export type Item = NonNullable<NonNullable<MenuProps['items']>[0]>;

function renderItem(item: MenuItem, itemRender?: ItemRender): React.ReactNode {
  if (itemRender) {
    return itemRender(item);
  }

  const { icon, name } = item;

  return (
    <>
      <FlexIcon icon={icon} className={`${prefixUI}-icon`} />
      <span>{name}</span>
    </>
  );
}

function renderLabel(item: MenuItem, selectedKeys: string[], itemRender?: ItemRender): React.ReactElement {
  const { link, children } = item;

  if ((children && children.length > 0) || !link) {
    return <span className={`${prefixUI}-title`}>{renderItem(item, itemRender)}</span>;
  } else {
    const { key } = item;
    const { href, target } = link;
    const replace = selectedKeys.includes(key);

    return (
      <Link href={href} className={`${prefixUI}-title`} replace={replace} target={target}>
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

        const { key, children } = current;
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
