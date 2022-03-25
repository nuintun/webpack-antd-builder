/**
 * @module router
 */

import { lazy } from 'react';

import Icon from '@ant-design/icons';
import { Route } from '/js/utils/router';

import HomeIcon from '/images/menus/home.svg';
import AnalysisIcon from '/images/menus/analysis.svg';
import UserAnalysisIcon from '/images/menus/user-analysis.svg';
import RechargeAnalysisIcon from '/images/menus/recharge-analysis.svg';
import SystemIcon from '/images/menus/system.svg';
import AccountSystemIcon from '/images/menus/account-system.svg';
import LogsSystemIcon from '/images/menus/logs-system.svg';

const Forbidden = lazy(() => import('/js/pages/403'));
const ServerError = lazy(() => import('/js/pages/500'));
const Layout = lazy(() => import('/js/components/Layout'));

export const router: Route<{ id?: number }>[] = [
  {
    path: '/403',
    element: <Forbidden />
  },
  {
    path: '/500',
    element: <ServerError />
  },
  {
    path: '/login',
    element: '登录页'
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        meta: {
          name: '网站首页',
          icon: <Icon component={HomeIcon} />
        },
        element: <p style={{ padding: 8 }}>网站首页</p>
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
            element: <p style={{ padding: 8 }}>用户分析</p>,
            meta: {
              name: '用户分析',
              icon: <Icon component={UserAnalysisIcon} />
            }
          },
          {
            path: 'recharge',
            element: <p style={{ padding: 8 }}>充值分析</p>,
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
            element: <p style={{ padding: 8 }}>帐号管理</p>,
            meta: {
              name: '帐号管理',
              icon: <Icon component={AccountSystemIcon} />
            }
          },
          {
            path: 'logs',
            element: <p style={{ padding: 8 }}>安全日志</p>,
            meta: {
              name: '安全日志',
              icon: <Icon component={LogsSystemIcon} />
            }
          }
        ]
      }
    ]
  }
];
