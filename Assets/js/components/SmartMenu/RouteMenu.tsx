import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import memoizeOne from 'memoize-one';
import { Menu, MenuProps } from 'antd';
import { isString } from '/js/utils/utils';
import usePrevious from '/js/hooks/usePrevious';
import { MenuItem } from '/js/utils/parseRouter';
import usePersistRef from '/js/hooks/usePersistRef';
import { Link, RouteComponentProps } from 'react-router-dom';
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

export interface RouteMenuProps<T> extends RouteComponentProps, Omit<MenuProps, OmitProps> {
  collapsed?: boolean;
  menus: MenuItem<T>[];
  icon?: string | React.ReactElement;
  menuItemRender?: (menu: MenuItem<T>) => React.ReactNode;
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

function titleRender<T>({ name, icon }: MenuItem<T>, hasWrapper: boolean = false): React.ReactElement {
  const Wrapper = hasWrapper ? 'span' : Fragment;
  const props = Wrapper === Fragment ? {} : { className: titleClassName };

  return (
    <Wrapper {...props}>
      {iconRender(icon)}
      <span>{name}</span>
    </Wrapper>
  );
}

function menuItemRender<T>(menu: MenuItem<T>, { location, menuItemRender }: RouteMenuProps<T>): React.ReactElement {
  const { key, name, href, target } = menu;
  const replace = href === `${location.pathname}${location.search}${location.hash}`;

  return (
    <Item key={key} title={name}>
      <Link to={href} className={titleClassName} replace={replace} target={target}>
        {menuItemRender ? menuItemRender(menu) : titleRender(menu)}
      </Link>
    </Item>
  );
}

function subMenuItemRender<T>(menu: MenuItem<T>, props: RouteMenuProps<T>): React.ReactElement {
  const { key, children } = menu;

  if (children && children.length) {
    return (
      <SubMenu key={key} title={titleRender(menu, true)}>
        {menuRender(children, props)}
      </SubMenu>
    );
  }

  return menuItemRender(menu, props);
}

function menuRender<T>(menus: MenuItem<T>[], props: RouteMenuProps<T>): React.ReactElement[] {
  return menus.map(menu => subMenuItemRender(menu, props));
}

function RouteMenu<T>(props: RouteMenuProps<T>): React.ReactElement {
  const { match, menus, history, location, onOpenChange, defaultOpenKeys, collapsed = false, ...restProps } = props;

  const prevProps = usePrevious<RouteMenuProps<T>>(props);
  const propsRef = usePersistRef<RouteMenuProps<T>>(props);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys || []);
  const items = useMemo(() => menuRender(menus, props), [menus, props]);
  const [openKeys, setOpenKeys] = useState<string[]>(collapsed ? [] : cachedOpenKeysRef.current);

  const memoizeMergeKeys = useMemo(() => memoizeOne(mergeKeys), []);
  const memoizeFlattenMenus = useMemo(() => memoizeOne(flattenMenus), []);
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
    const { match, menus, location, onOpenChange, collapsed = false } = props;

    if (
      !prevProps ||
      menus !== prevProps.menus ||
      collapsed !== prevProps.collapsed ||
      location.pathname !== prevProps.location.pathname
    ) {
      const flatMenus = memoizeFlattenMenus(menus);
      const cachedOpenKeys = cachedOpenKeysRef.current;
      const defaultKeys = memoizeGetExpandKeys(match.path, flatMenus);

      if (!collapsed) {
        const nextOpenKeys = memoizeMergeKeys(cachedOpenKeys, defaultKeys.openKeys, flatMenus);

        setOpenKeys(nextOpenKeys);

        cachedOpenKeysRef.current = nextOpenKeys;

        onOpenChange && onOpenChange(nextOpenKeys, nextOpenKeys);
      } else if (openKeys.length) {
        const nextOpenKeys: string[] = [];

        setOpenKeys(nextOpenKeys);

        onOpenChange && onOpenChange(nextOpenKeys, cachedOpenKeys);
      }

      setSelectedKeys(defaultKeys.selectedKeys);
    }
  }, [location, collapsed, menus, onOpenChange]);

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
}

export default memo(RouteMenu) as typeof RouteMenu;
