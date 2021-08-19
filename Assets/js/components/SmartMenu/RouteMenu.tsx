import React, { memo, useEffect, useRef, useState } from 'react';

import { Menu, MenuProps } from 'antd';
import { isString } from '~js/utils/utils';
import { MenuItem } from '~js/utils/getRouter';
import usePrevious from '~js/hooks/usePrevious';
import { Link, RouteComponentProps } from 'react-router-dom';
import usePersistCallback from '~js/hooks/usePersistCallback';
import { getExpandKeysFromPath, getFlatMenus, mergeKeys, prefixUI } from './SmartMenuUtils';

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

export interface RouteMenuProps extends RouteComponentProps, Omit<MenuProps, OmitProps> {
  menus: MenuItem[];
  collapsed?: boolean;
  icon?: string | React.ReactElement;
  menuItemRender?: (menu: MenuItem) => React.ReactNode;
  onOpenChange?: (openKeys: string[], cachedOpenKeys: string[]) => void;
}

function iconRender(icon?: string | React.ReactElement): React.ReactElement | null {
  if (icon) {
    if (isString(icon)) {
      return (
        <span className={`anticon ${iconClassName}`}>
          <img src={icon} alt="icon" />
        </span>
      );
    }

    return React.cloneElement(icon as React.ReactElement, { className: iconClassName });
  }

  return null;
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

function itemRender(menu: MenuItem, { location, menuItemRender }: RouteMenuProps): React.ReactElement {
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

function subMenuRender(menu: MenuItem, props: RouteMenuProps): React.ReactElement {
  const { key, children } = menu;

  if (children && children.length) {
    return (
      <SubMenu key={key} title={titleRender(menu, true)}>
        {menuRender(children, props)}
      </SubMenu>
    );
  }

  return itemRender(menu, props);
}

function menuRender(menus: MenuItem[], props: RouteMenuProps): React.ReactElement[] {
  return menus.map(menu => subMenuRender(menu, props));
}

export default memo(function RouteMenu(props: RouteMenuProps): React.ReactElement {
  const { match, menus, history, location, onOpenChange, defaultOpenKeys, collapsed = false, ...restProps } = props;

  const prevProps = usePrevious<RouteMenuProps>(props);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const cachedOpenKeysRef = useRef<string[]>(defaultOpenKeys || []);
  const [openKeys, setOpenKeys] = useState<string[]>(collapsed ? [] : cachedOpenKeysRef.current);

  const onOpenChangeHander = usePersistCallback((nextOpenKeys: React.Key[]): void => {
    const keys = nextOpenKeys.map(key => key.toString());

    setOpenKeys(keys);

    if (!collapsed) {
      cachedOpenKeysRef.current = keys;
    }

    onOpenChange && onOpenChange(keys, cachedOpenKeysRef.current);
  });

  useEffect(() => {
    if (
      !prevProps ||
      menus !== prevProps.menus ||
      collapsed !== prevProps.collapsed ||
      location.pathname !== prevProps.location.pathname
    ) {
      const flatMenus = getFlatMenus(menus);
      const cachedOpenKeys = cachedOpenKeysRef.current;
      const defaultKeys = getExpandKeysFromPath(match.path, flatMenus);

      if (!collapsed) {
        const nextOpenKeys = mergeKeys(cachedOpenKeys, defaultKeys.openKeys, flatMenus);

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
  }, [location, collapsed, menus, prevProps, onOpenChange]);

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
      {menuRender(menus, props)}
    </Menu>
  );
});
