/**
 * @module router
 */

import lazy from '/js/utils/lazy';
import Icon from '@ant-design/icons';
import { Route } from '/js/utils/router';
import Document from '/js/components/Document';

import HomeIcon from '/images/menus/home.svg';
import AnalysisIcon from '/images/menus/analysis.svg';
import UserAnalysisIcon from '/images/menus/user-analysis.svg';
import RechargeAnalysisIcon from '/images/menus/recharge-analysis.svg';
import SystemIcon from '/images/menus/system.svg';
import AccountSystemIcon from '/images/menus/account-system.svg';
import LogsSystemIcon from '/images/menus/logs-system.svg';
import TabsIcon from '/images/menus/tabs.svg';
import PageIcon from '/images/menus/page.svg';

export interface Meta {
  readonly id?: number;
  readonly type?: MenuType;
}

export const enum MenuType {
  Tabs,
  Hidden
}

export const router: readonly Route<Meta>[] = [
  {
    element: <Document />,
    children: [
      {
        path: '/403',
        meta: {
          name: '403',
          type: MenuType.Hidden
        },
        element: lazy(() => import('/js/pages/403'))
      },
      {
        path: '/500',
        meta: {
          name: '500',
          type: MenuType.Hidden
        },
        element: lazy(() => import('/js/pages/500'))
      },
      {
        path: '/',
        element: lazy(() => import('/js/components/Layout')),
        children: [
          {
            index: true,
            meta: {
              name: '网站首页',
              icon: <Icon component={HomeIcon} />
            },
            element: lazy(() => import('/js/pages/home'))
          },
          {
            path: 'analysis',
            meta: {
              name: '数据分析',
              icon: <Icon component={AnalysisIcon} />
            },
            children: [
              {
                path: 'user',
                element: lazy(() => import('/js/pages/analysis/User')),
                meta: {
                  name: '用户分析',
                  icon: <Icon component={UserAnalysisIcon} />
                }
              },
              {
                path: 'recharge',
                element: lazy(() => import('/js/pages/analysis/Recharge')),
                meta: {
                  name: '充值分析',
                  icon: <Icon component={RechargeAnalysisIcon} />
                }
              }
            ]
          },
          {
            path: 'system',
            meta: {
              name: '系统管理',
              icon: <Icon component={SystemIcon} />
            },
            children: [
              {
                path: 'account',
                element: lazy(() => import('/js/pages/system/Account')),
                meta: {
                  name: '帐号管理',
                  icon: <Icon component={AccountSystemIcon} />
                }
              },
              {
                path: 'logs',
                element: lazy(() => import('/js/pages/system/Logs')),
                meta: {
                  name: '安全日志',
                  icon: <Icon component={LogsSystemIcon} />
                }
              },
              {
                path: 'tabs',
                meta: {
                  name: '标签导航',
                  type: MenuType.Tabs,
                  icon: <Icon component={TabsIcon} />
                },
                element: lazy(() => import('/js/components/TabsLayout'), {
                  tabBarGutter: 16,
                  className: 'ui-layout-tabs'
                }),
                children: [
                  {
                    path: 'one',
                    meta: {
                      name: '标签页一',
                      type: MenuType.Hidden,
                      icon: <Icon component={PageIcon} />
                    },
                    element: <div className="ui-page">标签页一内容</div>
                  },
                  {
                    path: 'two',
                    meta: {
                      name: '标签页二',
                      type: MenuType.Hidden,
                      icon: <Icon component={PageIcon} />
                    },
                    element: <div className="ui-page">标签页二内容</div>
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
