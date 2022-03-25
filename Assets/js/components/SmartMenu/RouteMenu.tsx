import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import memoizeOne from 'memoize-one';
import Link from '/js/components/Link';
import { Menu, MenuProps } from 'antd';
import { isString } from '/js/utils/utils';
import { IRoute, MenuItem } from '/js/utils/router';
import usePersistRef from '/js/hooks/usePersistRef';
import { useLocation, useMatches } from 'react-nest-router';
import { flattenMenus, getExpandKeys, mergeKeys, prefixUI } from './SmartMenuUtils';

const { Fragment } = React;
const { SubMenu, Item } = Menu;

const iconClassName = `${prefixUI}-icon`;
const titleClassName = `${prefixUI}-title`;

type OmitProps =
  | 'mode'
  | 'multiple'
  | 'openKeys'
  | 'onDeselect'
  | 'selectedKeys'
  | 'inlineIndent'
  | 'onOpenChange'
  | 'defaultSelectedKeys';

export interface RouteMenuProps extends Omit<MenuProps, OmitProps> {
  menus: MenuItem[];
  collapsed?: boolean;
  icon?: string | React.ReactElement;
  menuItemRender?: (menu: MenuItem) => React.ReactNode;
  onOpenChange?: (openKeys: string[], cachedOpenKeys: string[]) => void;
}

function iconRender(icon?: string | React.ReactElement): React.ReactElement | undefined {
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

function titleRender({ name, icon }: MenuItem, hasWrapper: boolean = false): React.ReactElement {
  const Wrapper = hasWrapper ? 'span' : Fragment;
  const props = Wrapper === Fragment ? {} : { className: titleClassName };

  return (
    <Wrapper {...props}>
      {iconRender(icon)}
      <span>{name}</span>
    </Wrapper>
  );
}

function menuItemRender(
  menu: MenuItem,
  selectedKeys: string[],
  customItemRender: RouteMenuProps['menuItemRender']
): React.ReactElement {
  const { key, name } = menu;
  const { href, target } = menu.link!;
  const replace = selectedKeys.includes(key);

  return (
    <Item key={key} title={name}>
      <Link href={href} className={titleClassName} replace={replace} target={target}>
        {customItemRender ? customItemRender(menu) : titleRender(menu)}
      </Link>
    </Item>
  );
}

function subMenuItemRender(
  menu: MenuItem,
  selectedKeys: string[],
  customItemRender: RouteMenuProps['menuItemRender']
): React.ReactElement {
  const { key, children } = menu;

  if (children && children.length) {
    return (
      <SubMenu key={key} title={titleRender(menu, true)}>
        {menuRender(children, selectedKeys, customItemRender)}
      </SubMenu>
    );
  }

  return menuItemRender(menu, selectedKeys, customItemRender);
}

function menuRender(
  menus: MenuItem[],
  selectedKeys: string[],
  customItemRender: RouteMenuProps['menuItemRender']
): React.ReactElement[] {
  return menus.map(menu => subMenuItemRender(menu, selectedKeys, customItemRender));
}

export default memo(function RouteMenu(props: RouteMenuProps): React.ReactElement {
  const { menus, onOpenChange, defaultOpenKeys, collapsed, menuItemRender, ...restProps } = props;

  const { pathname } = useLocation();
  const matches = useMatches() as IRoute[];

  const propsRef = usePersistRef<RouteMenuProps>(props);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys || []);

  const memoizeMergeKeys = useMemo(() => memoizeOne(mergeKeys), []);
  const memoizeFlattenMenus = useMemo(() => memoizeOne(flattenMenus), []);
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
    const flatMenus = memoizeFlattenMenus(menus);
    const cachedOpenKeys = cachedOpenKeysRef.current;
    const defaultKeys = memoizeGetExpandKeys(matches, flatMenus);

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
  }, [pathname, collapsed, matches, menus, onOpenChange]);

  const items = useMemo(() => {
    return menuRender(menus, selectedKeys, menuItemRender);
  }, [selectedKeys, menuItemRender, menus]);

  return (
    <Menu
      {...restProps}
      mode="inline"
      multiple={false}
      inlineIndent={16}
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={onOpenChangeHander}
    >
      {items}
    </Menu>
  );
});
