/**
 * @module router
 */

import { lazy } from 'react';

import { Route } from '/js/utils/router';

const Forbidden = lazy(() => import('/js/pages/403'));
const ServerError = lazy(() => import('/js/pages/500'));
const Layout = lazy(() => import('/js/components/Layout'));

export const routes: Route<{ id?: number }>[] = [
  {
    path: '/403',
    element: <Forbidden />,
    meta: {
      hideInMenu: true,
      hideInBreadcrumb: true
    }
  },
  {
    path: '/500',
    element: <ServerError />,
    meta: {
      hideInMenu: true,
      hideInBreadcrumb: true
    }
  },
  {
    path: '/login',
    element: 'Login',
    meta: {
      hideInMenu: true,
      hideInBreadcrumb: true
    }
  },
  {
    path: '/',
    element: <Layout />,
    meta: {
      hideInMenu: true,
      hideInBreadcrumb: true
    },
    children: [
      {
        index: true,
        meta: {
          name: 'Home'
        },
        element: 'Home'
      },
      {
        path: 'news',
        meta: {
          name: 'News'
        },
        children: [
          {
            index: true,
            element: 'News',
            meta: { name: 'News' }
          },
          {
            path: 'sport',
            element: 'Sport',
            meta: { name: 'Sport' }
          }
        ]
      }
    ]
  }
];
