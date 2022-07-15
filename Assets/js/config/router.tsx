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
        element: lazy(() => import('/js/pages/403'))
      },
      {
        path: '/500',
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
                  name: '选项卡',
                  type: MenuType.Tabs,
                  icon: <Icon component={SystemIcon} />
                },
                element: lazy(() => import('/js/components/LayoutTabs')),
                children: [
                  {
                    path: 'account',
                    element: '帐号管理',
                    meta: {
                      name: '帐号管理',
                      type: MenuType.Hidden,
                      icon: <Icon component={AccountSystemIcon} />
                    }
                  },
                  {
                    path: 'logs',
                    element: '安全日志',
                    meta: {
                      name: '安全日志',
                      type: MenuType.Hidden,
                      icon: <Icon component={LogsSystemIcon} />
                    }
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
