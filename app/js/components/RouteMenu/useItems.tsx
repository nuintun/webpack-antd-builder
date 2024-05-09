/**
 * @module useItems
 */

import { MenuProps } from 'antd';
import { prefixUI } from './style';
import Link from '/js/components/Link';
import React, { useMemo } from 'react';
import { DFSTree } from '/js/utils/tree';
import { MenuItem } from '/js/utils/menus';
import FlexIcon from '/js/components/FlexIcon';

export type Item = NonNullable<MenuProps['items']>[0];
export type RenderItem = (item: MenuItem) => React.ReactNode;

function renderContent(item: MenuItem, renderItem?: RenderItem): React.ReactNode {
  if (renderItem) {
    return renderItem(item);
  }

  const { icon, name } = item;

  return (
    <>
      <FlexIcon icon={icon} className={`${prefixUI}-icon`} />
      <span>{name}</span>
    </>
  );
}

function renderLabel(item: MenuItem, selectedKeys: string[], renderItem?: RenderItem): React.ReactElement {
  const { link, children } = item;

  if ((children && children.length > 0) || !link) {
    return <span className={`${prefixUI}-title`}>{renderContent(item, renderItem)}</span>;
  } else {
    const { key } = item;
    const { href, target } = link;
    const replace = selectedKeys.includes(key);

    return (
      <Link href={href} className={`${prefixUI}-title`} replace={replace} target={target}>
        {renderContent(item, renderItem)}
      </Link>
    );
  }
}

export default function useItems(items: MenuItem[], selectedKeys: string[], renderItem?: RenderItem): Item[] {
  return useMemo(() => {
    const result: Item[] = [];
    const itemClassName = `${prefixUI}-item`;
    const submenuClassName = `${prefixUI}-submenu`;
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
            className: submenuClassName,
            popupClassName: submenuClassName,
            children: (itemMapping[key] = []),
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
          itemMapping[parent.key].push(item);
        } else {
          result.push(item);
        }
      }
    }

    return result;
  }, [selectedKeys, items, renderItem]);
}
