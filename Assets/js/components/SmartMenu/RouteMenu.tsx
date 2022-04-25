import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import memoizeOne from 'memoize-one';
import { Menu, MenuProps } from 'antd';
import { MenuItem } from '/js/utils/router';
import useItems, { ItemRender } from './useItems';
import usePersistRef from '/js/hooks/usePersistRef';
import { RouteComponentProps } from 'react-router-dom';
import { flattenItems, getExpandKeys, mergeKeys } from './SmartMenuUtils';

type OmitProps =
  | 'mode'
  | 'multiple'
  | 'openKeys'
  | 'onDeselect'
  | 'selectedKeys'
  | 'inlineIndent'
  | 'onOpenChange'
  | 'defaultSelectedKeys';

export interface RouteMenuProps<T> extends RouteComponentProps, Omit<MenuProps, OmitProps> {
  collapsed?: boolean;
  items: MenuItem<T>[];
  itemRender?: ItemRender<T>;
  icon?: string | React.ReactElement;
  onOpenChange?: (openKeys: string[], cachedOpenKeys: string[]) => void;
}

function RouteMenu<T>(props: RouteMenuProps<T>): React.ReactElement {
  const { match, items, history, location, itemRender, onOpenChange, defaultOpenKeys, collapsed = false, ...restProps } = props;

  const propsRef = usePersistRef<RouteMenuProps<T>>(props);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys || []);
  const [openKeys, setOpenKeys] = useState<string[]>(collapsed ? [] : cachedOpenKeysRef.current);

  const memoizeMergeKeys = useMemo(() => memoizeOne(mergeKeys), []);
  const memoizeFlattenItems = useMemo(() => memoizeOne(flattenItems), []);
  const memoizeGetExpandKeys = useMemo(() => memoizeOne(getExpandKeys), []);

  const onOpenChangeHander = useCallback((nextOpenKeys: React.Key[]): void => {
    const keys = nextOpenKeys.map(key => key.toString());
    const { onOpenChange, collapsed = false } = propsRef.current;

    setOpenKeys(keys);

    if (!collapsed) {
      cachedOpenKeysRef.current = keys;
    }

    onOpenChange && onOpenChange(keys, cachedOpenKeysRef.current);
  }, []);

  useEffect(() => {
    const flatMenus = memoizeFlattenItems(items);
    const cachedOpenKeys = cachedOpenKeysRef.current;
    const defaultKeys = memoizeGetExpandKeys(match.path, flatMenus);

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
  }, [match.path, collapsed, items, onOpenChange]);

  return (
    <Menu
      {...restProps}
      mode="inline"
      multiple={false}
      inlineIndent={16}
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={onOpenChangeHander}
      items={useItems<T>(items, selectedKeys, itemRender)}
    />
  );
}

export default memo(RouteMenu) as typeof RouteMenu;
