import { memo, useCallback, useMemo } from 'react';

import useTheme, { Theme } from '/js/hooks/useTheme';
import Icon, { LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps, message } from 'antd';
import { HeaderRenderProps } from '/js/components/FlexMenu';
import { MenuClickEventHandler } from 'rc-menu/es/interface';

import logo from '/images/logo.svg?url';

import ThemeIcon from '/images/theme.svg';
import ThemeDarkIcon from '/images/theme-dark.svg';
import ThemeLightIcon from '/images/theme-light.svg';
import { useStyleSheets } from '/js/hooks/useStyleSheets';

const prefixUI = 'ui-right-header';

function getDropdownActiveClassName(selected: boolean): string | undefined {
  if (selected) return 'ant-dropdown-menu-item-selected';
}

function getThemeItems(theme: Theme, onThemeClick?: MenuClickEventHandler): MenuProps['items'] {
  return [
    {
      key: 'dark',
      onClick: onThemeClick,
      className: getDropdownActiveClassName(theme === 'dark'),
      label: (
        <a>
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
        <a>
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

  const menu = useMemo<MenuProps>(() => {
    return {
      theme,
      items: getThemeItems(theme, onThemeClick)
    };
  }, [theme]);

  return (
    <Dropdown placement="bottomRight" menu={menu}>
      <div title="Theme">
        <Icon component={ThemeIcon} style={{ fontSize: 24 }} />
      </div>
    </Dropdown>
  );
});

const LogoutAction = memo(function LogoutAction(): React.ReactElement {
  const onClick = useCallback(() => {
    message.info('你点击了退出系统😁');
  }, []);

  return (
    <a onClick={onClick}>
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
                <Icon component={ThemeIcon} style={{ fontSize: 18, marginRight: 8 }} />
                <span>主题设置</span>
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
      <div className="ui-user-profile">
        <Avatar size={40} src={logo} alt="avatar" />
        <span className="ui-user-name">Antd</span>
      </div>
    </Dropdown>
  );
});

export default memo(function RightHeader({ isMobile }: HeaderRenderProps): React.ReactElement {
  const render = useStyleSheets(['components', 'RightHeader'], token => {
    return {
      [`.${prefixUI}`]: {
        padding: 0
      }
    };
  });

  return render(
    <div className={prefixUI}>
      {!isMobile && <ThemeAction />}
      <UserAction isMobile={isMobile} />
    </div>
  );
});
