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

const Home = lazy(() => import('/js/pages/home'));
const User = lazy(() => import('/js/pages/analysis/User'));
const Recharge = lazy(() => import('/js/pages/analysis/Recharge'));
const Account = lazy(() => import('/js/pages/system/Account'));
const Logs = lazy(() => import('/js/pages/system/Logs'));
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
        element: <Home />
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
            element: <User />,
            meta: {
              name: '用户分析',
              icon: <Icon component={UserAnalysisIcon} />
            }
          },
          {
            path: 'recharge',
            element: <Recharge />,
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
            element: <Account />,
            meta: {
              name: '帐号管理',
              icon: <Icon component={AccountSystemIcon} />
            }
          },
          {
            path: 'logs',
            element: <Logs />,
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
