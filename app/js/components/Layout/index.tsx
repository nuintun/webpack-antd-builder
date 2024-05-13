/**
 * @module index
 */

import LogoHeader from './headers/Logo';
import { Route } from '/js/utils/router';
import useTheme from '/js/hooks/useTheme';
import React, { memo, useMemo } from 'react';
import ActionsHeader from './headers/Actions';
import { Filter, parse } from '/js/utils/menus';
import FlexLayout from '/js/components/FlexLayout';
import { MenuType, Meta } from '/js/config/router';
import { RenderHeader } from '/js/components/FlexMenu';
import { Outlet, useOutletContext } from 'react-nest-router';

const renderLogoHeader: RenderHeader = props => <LogoHeader {...props} />;
const renderActionsHeader: RenderHeader = props => <ActionsHeader {...props} />;

export default memo(function Layout(): React.ReactElement {
  const [theme] = useTheme();
  const routes = useOutletContext<Route<Meta>[]>();

  const menus = useMemo(() => {
    return parse<Meta>(
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
            return {
              ...menu,
              link: {
                href: tab.meta.link.href,
                target: menu.link?.target
              }
            };
          }
        }

        return menu;
      }
    );
  }, [routes]);

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
