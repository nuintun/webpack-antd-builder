import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import memoizeOne from 'memoize-one';
import { Menu, MenuProps } from 'antd';
import { IRoute } from '/js/utils/router';
import { MenuItem } from '/js/utils/menus';
import useSyncRef from '/js/hooks/useSyncRef';
import useItems, { ItemRender } from './useItems';
import { useLocation, useMatches } from 'react-nest-router';
import { flattenItems, getExpandKeys, mergeKeys } from './SmartMenuUtils';

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
  const { items, onOpenChange, defaultOpenKeys, collapsed, itemRender, ...restProps } = props;

  const { pathname } = useLocation();
  const matches = useMatches() as IRoute[];

  const propsRef = useSyncRef<RouteMenuProps>(props);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys || []);

  const memoizeMergeKeys = useMemo(() => memoizeOne(mergeKeys), []);
  const memoizeFlattenItems = useMemo(() => memoizeOne(flattenItems), []);
  const memoizeGetExpandKeys = useMemo(() => memoizeOne(getExpandKeys), []);

  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => []);
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
    const flatItems = memoizeFlattenItems(items);
    const cachedOpenKeys = cachedOpenKeysRef.current;
    const defaultKeys = memoizeGetExpandKeys(matches, flatItems);

    if (!collapsed) {
      const nextOpenKeys = memoizeMergeKeys(cachedOpenKeys, defaultKeys.openKeys);

      setOpenKeys(nextOpenKeys);

      cachedOpenKeysRef.current = nextOpenKeys;

      onOpenChange && onOpenChange(nextOpenKeys, nextOpenKeys);
    } else if (openKeys.length) {
      const nextOpenKeys: string[] = [];

      setOpenKeys(nextOpenKeys);

      onOpenChange && onOpenChange(nextOpenKeys, cachedOpenKeys);
    }

    setSelectedKeys(defaultKeys.selectedKeys);
  }, [pathname, collapsed, matches, items, onOpenChange]);

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
