/**
 * @module index
 */

import clsx from 'clsx';
import { Menu, MenuProps } from 'antd';
import { IRoute } from '/js/utils/router';
import { MenuItem } from '/js/utils/menus';
import useStyles, { prefixCls } from './style';
import { useMatches } from 'react-nest-router';
import useItems, { RenderItem } from './useItems';
import useLatestRef from '/js/hooks/useLatestRef';
import { SiderContext } from 'antd/es/layout/Sider';
import { flattenItems, getExpandKeys, mergeKeys } from './utils';
import React, { memo, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type OmitProps =
  | 'items'
  | 'multiple'
  | 'openKeys'
  | 'onDeselect'
  | 'selectable'
  | 'onOpenChange'
  | 'selectedKeys'
  | 'defaultSelectedKeys';

export interface RouteMenuProps extends Omit<MenuProps, OmitProps> {
  items: MenuItem[];
  renderItem?: RenderItem;
  icon?: string | React.ReactElement;
  onOpenChange?: (openKeys: string[], cachedOpenKeys: string[]) => void;
}

export default memo(function RouteMenu(props: RouteMenuProps) {
  const { inlineCollapsed } = props;
  const { items, renderItem, className, defaultOpenKeys, ...restProps } = props;

  const scope = useStyles();
  const matches = useMatches() as IRoute[];
  const { siderCollapsed } = use(SiderContext);
  const propsRef = useLatestRef<RouteMenuProps>(props);
  const flatItems = useMemo(() => flattenItems(items), [items]);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys ?? []);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => []);
  const expandKeys = useMemo(() => getExpandKeys(matches, flatItems), [matches, flatItems]);
  const collapsed = useMemo(() => siderCollapsed ?? inlineCollapsed, [inlineCollapsed, siderCollapsed]);
  const [openKeys, setOpenKeys] = useState<string[]>(() => (collapsed ? [] : cachedOpenKeysRef.current));

  const onOpenChangeHander = useCallback(
    (openKeys: string[]): void => {
      const { onOpenChange } = propsRef.current;

      setOpenKeys(openKeys);

      if (!collapsed) {
        cachedOpenKeysRef.current = openKeys;
      }

      onOpenChange?.(openKeys, cachedOpenKeysRef.current);
    },
    [collapsed]
  );

  useEffect(() => {
    const { onOpenChange } = propsRef.current;
    const { openKeys, selectedKeys } = expandKeys;
    const cachedOpenKeys = cachedOpenKeysRef.current;

    if (!collapsed) {
      const nextOpenKeys = mergeKeys(cachedOpenKeys, openKeys);

      setOpenKeys(nextOpenKeys);

      cachedOpenKeysRef.current = nextOpenKeys;

      onOpenChange?.(nextOpenKeys, nextOpenKeys);
    } else if (openKeys.length > 0) {
      const nextOpenKeys: string[] = [];

      setOpenKeys(nextOpenKeys);

      onOpenChange?.(nextOpenKeys, cachedOpenKeys);
    }

    setSelectedKeys(selectedKeys);
  }, [expandKeys, collapsed]);

  return (
    <Menu
      {...restProps}
      multiple={false}
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={onOpenChangeHander}
      className={clsx(scope, prefixCls, className, {
        [`${prefixCls}-collapsed`]: collapsed
      })}
      items={useItems(items, selectedKeys, renderItem)}
    />
  );
});
