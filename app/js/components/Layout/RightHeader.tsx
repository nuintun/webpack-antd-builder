import { memo, useCallback, useMemo } from 'react';

import classNames from 'classnames';
import useStyle, { prefixUI } from './style/right';
import useTheme, { Theme } from '/js/hooks/useTheme';
import { App, Avatar, Dropdown, MenuProps } from 'antd';
import Icon, { LogoutOutlined } from '@ant-design/icons';
import { HeaderRenderProps } from '/js/components/FlexMenu';

import logo from '/images/logo.svg?url';

import ThemeIcon from '/images/theme.svg';
import ThemeDarkIcon from '/images/theme-dark.svg';
import ThemeLightIcon from '/images/theme-light.svg';

const { useApp } = App;

type MenuClickEventHandler = NonNullable<MenuProps['onClick']>;

function getDropdownActiveClassName(selected: boolean): string | undefined {
  if (selected) {
    return 'ant-dropdown-menu-item-selected';
  }
}

function getThemeItems(theme: Theme, onThemeClick?: MenuClickEventHandler): MenuProps['items'] {
  return [
    {
      key: 'light',
      onClick: onThemeClick,
      className: getDropdownActiveClassName(theme === 'light'),
      label: (
        <a>
          <Icon component={ThemeLightIcon} />
          <span style={{ marginInlineStart: 4 }}>浅色主题</span>
        </a>
      )
    },
    {
      key: 'dark',
      onClick: onThemeClick,
      className: getDropdownActiveClassName(theme === 'dark'),
      label: (
        <a>
          <Icon component={ThemeDarkIcon} />
          <span style={{ marginInlineStart: 4 }}>暗色主题</span>
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

  const menu = useMemo<MenuProps>(() => {
    return {
      theme,
      items: getThemeItems(theme, onThemeClick)
    };
  }, [theme]);

  return (
    <Dropdown placement="bottomRight" menu={menu}>
      <Icon component={ThemeIcon} style={{ fontSize: 24 }} />
    </Dropdown>
  );
});

const LogoutAction = memo(function LogoutAction(): React.ReactElement {
  const { message } = useApp();

  const onClick = useCallback(() => {
    message.info('你点击了退出系统😁');
  }, []);

  return (
    <a onClick={onClick}>
      <LogoutOutlined />
      <span style={{ marginInlineStart: 4 }}>退出系统</span>
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

  const menu = useMemo<MenuProps>(() => {
    const logout = {
      key: 'logout',
      label: <LogoutAction />
    };

    if (isMobile) {
      return {
        theme,
        items: [
          {
            theme,
            key: 'theme',
            children: getThemeItems(theme, onThemeClick),
            label: (
              <a>
                <Icon component={ThemeIcon} />
                <span style={{ marginInlineStart: 4 }}>主题设置</span>
              </a>
            )
          },
          logout
        ]
      };
    }

    return {
      theme,
      items: [logout]
    };
  }, [theme, isMobile]);

  return (
    <Dropdown placement="bottomRight" menu={menu}>
      <div className={`${prefixUI}-profile`}>
        <Avatar size={40} src={logo} alt="avatar" />
        <span style={{ marginInlineStart: 4 }}>Antd</span>
      </div>
    </Dropdown>
  );
});

export default memo(function RightHeader({ isMobile }: HeaderRenderProps): React.ReactElement {
  const { hashId, render } = useStyle();

  return render(
    <div className={classNames(hashId, prefixUI)}>
      {!isMobile && <ThemeAction />}
      <UserAction isMobile={isMobile} />
    </div>
  );
});
