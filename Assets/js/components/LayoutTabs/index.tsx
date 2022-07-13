/**
 * @module LayoutTabs
 */

import './index.less';

import { memo } from 'react';

import { Tabs } from 'antd';
import { Meta } from '/js/config/router';
import { IRoute } from '/js/utils/router';
import { Outlet, useMatch } from 'react-nest-router';
import Link from '/js/components/Link';

const { TabPane } = Tabs;

export default memo(function LayoutTabs() {
  const route = useMatch() as IRoute<Meta>;

  return (
    <div className="ui-page ui-tabs-page">
      <Tabs>
        {route.children?.map(({ meta: { key, name, link } }) => (
          <TabPane
            key={key}
            tab={
              <Link className="ui-tab-nav" href={link.href} target={link.target}>
                {name}
              </Link>
            }
          >
            <Outlet />
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
});
