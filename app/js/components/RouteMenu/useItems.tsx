/**
 * @module useItems
 */

import { prefixCls } from './style';
import Link from '/js/components/Link';
import React, { useMemo } from 'react';
import { DFSTree } from '/js/utils/Tree';
import { GetProp, MenuProps } from 'antd';
import { MenuItem } from '/js/utils/menus';
import FlexIcon from '/js/components/FlexIcon';

export interface RenderItem {
  (item: MenuItem): React.ReactNode;
}

export type Item = GetProp<MenuProps, 'items'>[number];

function getInitialChildren({ children }: MenuItem): Item[] | undefined {
  if (children && children.length > 0) {
    return [];
  }
}

function renderTitle(item: MenuItem, renderItem?: RenderItem): React.ReactNode {
  if (renderItem) {
    return renderItem(item);
  }

  return item.name;
}

function renderLabel(item: MenuItem, selectedKeys: string[], renderItem?: RenderItem): React.ReactNode {
  const { link, children } = item;

  if ((children && children.length > 0) || !link) {
    return renderTitle(item, renderItem);
  } else {
    const { key } = item;
    const { href, target } = link;
    const replace = selectedKeys.includes(key);

    return (
      <Link to={href} replace={replace} target={target}>
        {renderTitle(item, renderItem)}
      </Link>
    );
  }
}

export default function useItems(items: MenuItem[], selectedKeys: string[], renderItem?: RenderItem): Item[] {
  return useMemo(() => {
    const menuItems: Item[] = [];
    const className = `${prefixCls}-item`;
    const popupClassName = `${prefixCls}-popup`;
    const menuItemsMap: Map<string, Item[]> = new Map();

    for (const item of items) {
      const tree = new DFSTree(item, item => item.children);

      for (const [current, parent] of tree) {
        const { key, icon } = current;
        const children = getInitialChildren(current);

        const item: Item = {
          key,
          children,
          className,
          popupClassName,
          label: renderLabel(current, selectedKeys, renderItem),
          icon: <FlexIcon icon={icon} className={`${prefixCls}-icon`} />
        };

        if (children) {
          menuItemsMap.set(key, children);
        }

        if (parent) {
          menuItemsMap.get(parent.key)?.push(item);
        } else {
          menuItems.push(item);
        }
      }
    }

    return menuItems;
  }, [selectedKeys, items, renderItem]);
}
