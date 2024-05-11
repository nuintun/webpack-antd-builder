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

export type Item = GetProp<MenuProps, 'items'>[0];
export type RenderItem = (item: MenuItem) => React.ReactNode;

function renderContent(item: MenuItem, renderItem?: RenderItem): React.ReactNode {
  if (renderItem) {
    return renderItem(item);
  }

  const { icon, name } = item;

  return (
    <>
      <FlexIcon icon={icon} className={`${prefixCls}-icon`} />
      <span>{name}</span>
    </>
  );
}

function renderLabel(item: MenuItem, selectedKeys: string[], renderItem?: RenderItem): React.ReactElement {
  const { link, children } = item;

  if ((children && children.length > 0) || !link) {
    return <span className={`${prefixCls}-title`}>{renderContent(item, renderItem)}</span>;
  } else {
    const { key } = item;
    const { href, target } = link;
    const replace = selectedKeys.includes(key);

    return (
      <Link href={href} className={`${prefixCls}-title`} replace={replace} target={target}>
        {renderContent(item, renderItem)}
      </Link>
    );
  }
}

export default function useItems(items: MenuItem[], selectedKeys: string[], renderItem?: RenderItem): Item[] {
  return useMemo(() => {
    const menuItems: Item[] = [];
    const itemClassName = `${prefixCls}-item`;
    const submenuClassName = `${prefixCls}-submenu`;
    const menuItemsMapping: Record<string, Item[]> = {};

    for (const item of items) {
      const tree = new DFSTree(item, item => item.children);

      for (const [current, parent] of tree) {
        let item: Item;

        const { key, children } = current;
        const hasChildren = children && children.length > 0;

        if (hasChildren) {
          item = {
            key,
            className: submenuClassName,
            popupClassName: submenuClassName,
            children: (menuItemsMapping[key] = []),
            label: renderLabel(current, selectedKeys, renderItem)
          };
        } else {
          item = {
            key,
            className: itemClassName,
            label: renderLabel(current, selectedKeys, renderItem)
          };
        }

        if (parent) {
          menuItemsMapping[parent.key].push(item);
        } else {
          menuItems.push(item);
        }
      }
    }

    return menuItems;
  }, [selectedKeys, items, renderItem]);
}
