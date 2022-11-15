import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Menu, MenuProps } from 'antd';
import { IRoute } from '/js/utils/router';
import { MenuItem } from '/js/utils/menus';
import { useMatches } from 'react-nest-router';
import useItems, { ItemRender } from './useItems';
import useLatestRef from '/js/hooks/useLatestRef';
import { flattenItems, getExpandKeys, mergeKeys } from './utils';

type OmitProps =
  | 'mode'
  | 'items'
  | 'multiple'
  | 'openKeys'
  | 'onDeselect'
  | 'selectedKeys'
  | 'inlineIndent'
  | 'onOpenChange'
  | 'defaultSelectedKeys';

export interface RouteMenuProps extends Omit<MenuProps, OmitProps> {
  items: MenuItem[];
  collapsed?: boolean;
  itemRender?: ItemRender;
  icon?: string | React.ReactElement;
  onOpenChange?: (openKeys: string[], cachedOpenKeys: string[]) => void;
}

export default memo(function RouteMenu(props: RouteMenuProps): React.ReactElement {
  const { collapsed, defaultOpenKeys, itemRender, items, ...restProps } = props;

  const matches = useMatches() as IRoute[];
  const propsRef = useLatestRef<RouteMenuProps>(props);
  const flatItems = useMemo(() => flattenItems(items), [items]);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys || []);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => []);
  const expandKeys = useMemo(() => getExpandKeys(matches, flatItems), [matches, flatItems]);
  const [openKeys, setOpenKeys] = useState<string[]>(() => (collapsed ? [] : cachedOpenKeysRef.current));

  const onOpenChangeHander = useCallback((openKeys: string[]): void => {
    const { onOpenChange, collapsed } = propsRef.current;

    setOpenKeys(openKeys);

    if (!collapsed) {
      cachedOpenKeysRef.current = openKeys;
    }

    onOpenChange && onOpenChange(openKeys, cachedOpenKeysRef.current);
  }, []);

  useEffect(() => {
    const { onOpenChange } = propsRef.current;
    const { openKeys, selectedKeys } = expandKeys;
    const cachedOpenKeys = cachedOpenKeysRef.current;

    if (!collapsed) {
      const nextOpenKeys = mergeKeys(cachedOpenKeys, openKeys);

      setOpenKeys(nextOpenKeys);

      cachedOpenKeysRef.current = nextOpenKeys;

      onOpenChange && onOpenChange(nextOpenKeys, nextOpenKeys);
    } else if (openKeys.length > 0) {
      const nextOpenKeys: string[] = [];

      setOpenKeys(nextOpenKeys);

      onOpenChange && onOpenChange(nextOpenKeys, cachedOpenKeys);
    }

    setSelectedKeys(selectedKeys);
  }, [expandKeys, collapsed]);

  return (
    <Menu
      {...restProps}
      mode="inline"
      multiple={false}
      inlineIndent={16}
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={onOpenChangeHander}
      items={useItems(items, selectedKeys, itemRender)}
    />
  );
});
