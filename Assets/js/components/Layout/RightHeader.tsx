import './index.less';

import { memo, useCallback, useMemo } from 'react';

import useTheme from '/js/hooks/useTheme';
import { HeaderRenderProps } from '../SmartMenu';
import Icon, { LogoutOutlined } from '@ant-design/icons';
import { MenuClickEventHandler } from 'rc-menu/es/interface';
import { Avatar, Dropdown, Menu, MenuProps, message } from 'antd';

import logo from '/images/logo.svg?url';

import ThemeIcon from '/images/theme.svg';
import ThemeDarkIcon from '/images/theme-dark.svg';
import ThemeLightIcon from '/images/theme-light.svg';

function getDropdownActiveClassName(selected: boolean): string {
  return selected ? 'ant-dropdown-menu-item-selected' : '';
}

function getThemeItems(theme?: string, onThemeClick?: MenuClickEventHandler): MenuProps['items'] {
  return [
    {
      key: 'dark',
      onClick: onThemeClick,
      className: getDropdownActiveClassName(theme === 'dark'),
      label: (
        <a className="ui-vertical-middle">
          <Icon component={ThemeDarkIcon} style={{ fontSize: 18, marginRight: 8 }} />
          <span>暗色主题</span>
        </a>
      )
    },
    {
      key: 'light',
      onClick: onThemeClick,
      className: getDropdownActiveClassName(theme === 'light'),
      label: (
        <a className="ui-vertical-middle">
          <Icon component={ThemeLightIcon} style={{ fontSize: 18, marginRight: 8 }} />
          <span>浅色主题</span>
        </a>
      )
    }
  ];
}

const ThemeAction = memo(function ThemeAction(): React.ReactElement {
  const [theme, setTheme] = useTheme();

  const onThemeClick = useCallback<MenuClickEventHandler>(({ key }) => {
    setTheme(key as 'dark' | 'light');
  }, []);

  const items = useMemo(() => getThemeItems(theme, onThemeClick), [theme]);

  return (
    <Dropdown placement="bottomRight" overlay={<Menu selectable theme={theme} items={items} />}>
      <div title="Theme">
        <Icon component={ThemeIcon} style={{ fontSize: 24, color: theme === 'dark' ? '#fff' : '#000' }} />
      </div>
    </Dropdown>
  );
});

const LogoutAction = memo(function LogoutAction(): React.ReactElement {
  const onClick = useCallback(() => {
    message.info('你点击了退出系统😁');
  }, []);

  return (
    <a className="ui-vertical-middle" onClick={onClick}>
      <LogoutOutlined style={{ fontSize: 16, marginRight: 8 }} />
      <span>退出系统</span>
    </a>
  );
});

interface UserActionProps {
  isMobile: boolean;
}

const UserAction = memo(function UserAction({ isMobile }: UserActionProps): React.ReactElement {
  const [theme, setTheme] = useTheme();

  const onThemeClick = useCallback<MenuClickEventHandler>(({ key }) => {
    setTheme(key as 'dark' | 'light');
  }, []);

  const items = useMemo<MenuProps['items']>(() => {
    const logout = {
      key: 'logout',
      label: <LogoutAction />
    };

    if (isMobile) {
      return [
        {
          key: 'theme',
          children: getThemeItems(theme, onThemeClick),
          label: (
            <a className="ui-vertical-middle" style={{ display: 'inline-flex' }}>
              <Icon component={ThemeIcon} style={{ fontSize: 18, marginRight: 8 }} />
              <span>主题设置</span>
            </a>
          )
        },
        logout
      ];
    }

    return [logout];
  }, [theme, isMobile]);

  return (
    <Dropdown placement="bottomRight" overlay={<Menu theme={theme} items={items} />}>
      <div className="ui-info-box">
        <Avatar size={40} src={logo} alt="avatar" />
        <span className="ui-user-name">Antd</span>
      </div>
    </Dropdown>
  );
});

export default memo(function RightHeader({ theme, isMobile }: HeaderRenderProps): React.ReactElement {
  return (
    <div className={`ui-right-header ui-${theme}-right-header`}>
      {!isMobile && <ThemeAction />}
      <UserAction isMobile={isMobile} />
    </div>
  );
});
