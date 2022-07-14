/**
 * @module LayoutTabs
 */

import './index.less';

import { memo, useMemo } from 'react';

import { Tabs } from 'antd';
import Link from '/js/components/Link';
import { Meta } from '/js/config/router';
import { IRoute } from '/js/utils/router';
import { useMatch, useMatches } from 'react-nest-router';

const { TabPane } = Tabs;

export interface LayoutTabsProps {
  icon?: boolean;
}

export default memo(function LayoutTabs({ icon }: LayoutTabsProps) {
  const matches = useMatches() as IRoute<Meta>[];
  const { children: tabs = [] } = useMatch() as IRoute<Meta>;

  const activeTab = useMemo(() => {
    return matches.find(({ meta: { key } }) => {
      return tabs.some(({ meta }) => meta.key === key);
    });
  }, [matches, tabs]);

  return (
    <div className="ui-page ui-tabs-page">
      <Tabs activeKey={activeTab?.meta.key}>
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
