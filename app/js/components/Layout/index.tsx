/**
 * @module index
 */

import LogoHeader from './headers/Logo';
import { Route } from '/js/utils/router';
import useTheme from '/js/hooks/useTheme';
import ActionsHeader from './headers/Actions';
import FlexLayout from '/js/components/FlexLayout';
import { MenuType, Meta } from '/js/config/router';
import { RenderHeader } from '/js/components/FlexMenu';
import React, { memo, useEffect, useState } from 'react';
import { Filter, MenuItem, parse } from '/js/utils/menus';
import { Outlet, useOutletContext } from 'react-nest-router';

const renderLogoHeader: RenderHeader = props => <LogoHeader {...props} />;
const renderActionsHeader: RenderHeader = props => <ActionsHeader {...props} />;

export default memo(function Layout(): React.ReactElement {
  const [theme] = useTheme();
  const routes = useOutletContext<Route<Meta>[]>();
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    setMenus(
      parse(
        routes,
        ({ meta }) => {
          switch (meta.type) {
            case MenuType.TABS:
              return Filter.PRESERVE_SELF;
            case MenuType.HIDDEN:
              return Filter.REMOVE_SELF;
            default:
              return Filter.DEFAULT;
          }
        },
        (menu, { meta, children }) => {
          if (children && meta.type === MenuType.TABS) {
            const [tab] = children;

            if (tab) {
              const { href, target } = tab.meta.link;

              return { ...menu, link: { href, target } };
            }
          }

          return menu;
        }
      )
    );
  }, []);

  return (
    <FlexLayout
      theme={theme}
      menus={menus}
      siderWidth={216}
      renderLogoHeader={renderLogoHeader}
      renderActionsHeader={renderActionsHeader}
    >
      <Outlet />
    </FlexLayout>
  );
});
