import './index.less';

import { memo, useCallback } from 'react';

import useTheme from '/js/hooks/useTheme';
import { HeaderRenderProps } from '../SmartMenu';
import { Avatar, Dropdown, Menu, message } from 'antd';
import Icon, { LogoutOutlined } from '@ant-design/icons';
import { MenuClickEventHandler } from 'rc-menu/es/interface';

import logo from '/images/logo.svg?url';

import ThemeIcon from '/images/theme.svg';
import ThemeDarkIcon from '/images/theme-dark.svg';
import ThemeLightIcon from '/images/theme-light.svg';

function getDropdownClassName(selected: boolean): string {
  return selected ? 'ant-dropdown-menu-item-selected' : '';
}

const ThemeAction = memo(function ThemeAction(): React.ReactElement {
  const [theme, setTheme] = useTheme();
  const onSelect: MenuClickEventHandler = useCallback(({ key }) => {
    setTheme(key as 'dark' | 'light');
  }, []);

  return (
    <Dropdown
      placement="bottomRight"
      overlay={
        <Menu selectable theme={theme} onSelect={onSelect} defaultSelectedKeys={[theme]}>
          <Menu.Item key="dark">
            <a className="ui-vertical-middle">
              <Icon component={ThemeDarkIcon} style={{ fontSize: 18, marginRight: 8 }} />
              <span>暗色主题</span>
            </a>
          </Menu.Item>
          <Menu.Item key="light">
            <a className="ui-vertical-middle">
              <Icon component={ThemeLightIcon} style={{ fontSize: 18, marginRight: 8 }} />
              <span>浅色主题</span>
            </a>
          </Menu.Item>
        </Menu>
      }
    >
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

  const onClick: MenuClickEventHandler = useCallback(({ key }) => {
    setTheme(key as 'dark' | 'light');
  }, []);

  return (
    <Dropdown
      placement="bottomRight"
      overlay={
        <Menu theme={theme}>
          {isMobile && (
            <Menu.SubMenu
              key="theme"
              title={
                <a className="ui-vertical-middle" style={{ display: 'inline-flex' }}>
                  <Icon component={ThemeIcon} style={{ fontSize: 18, marginRight: 8 }} />
                  <span>主题设置</span>
                </a>
              }
            >
              <Menu.Item key="dark" className={getDropdownClassName(theme === 'dark')} onClick={onClick}>
                <a className="ui-vertical-middle">
                  <Icon component={ThemeDarkIcon} style={{ fontSize: 18, marginRight: 8 }} />
                  <span>暗色主题</span>
                </a>
              </Menu.Item>
              <Menu.Item key="light" className={getDropdownClassName(theme === 'light')} onClick={onClick}>
                <a className="ui-vertical-middle">
                  <Icon component={ThemeLightIcon} style={{ fontSize: 18, marginRight: 8 }} />
                  <span>浅色主题</span>
                </a>
              </Menu.Item>
            </Menu.SubMenu>
          )}
          <Menu.Item key="logout">
            <LogoutAction />
          </Menu.Item>
        </Menu>
      }
    >
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
