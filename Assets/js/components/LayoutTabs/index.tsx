/**
 * @module LayoutTabs
 */

import './index.less';

import React, { memo, useMemo } from 'react';

import { Tabs } from 'antd';
import Link from '/js/components/Link';
import { Meta } from '/js/config/router';
import { IRoute } from '/js/utils/router';
import { useMatch, useMatches, useMatchIndex } from 'react-nest-router';

const { TabPane } = Tabs;

export interface LayoutTabsProps {
  icon?: boolean;
}

export default memo(function LayoutTabs({ icon }: LayoutTabsProps): React.ReactElement {
  const index = useMatchIndex();
  const matches = useMatches() as IRoute<Meta>[];
  const { children: tabs = [] } = useMatch() as IRoute<Meta>;
  const activeKey = useMemo(() => matches[index + 1]?.meta.key, [matches, index]);

  return (
    <div className="ui-page ui-tabs-page">
      <Tabs activeKey={activeKey}>
        {tabs.map(({ meta, element }) => {
          const { link } = meta;

          return (
            <TabPane
              key={meta.key}
              tab={
                <Link className="ui-tab-nav" href={link.href} target={link.target}>
                  {icon && meta.icon}
                  {meta.name}
                </Link>
              }
            >
              {element}
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
});
