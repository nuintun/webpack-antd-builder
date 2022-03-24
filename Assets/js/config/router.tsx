/**
 * @module router
 */

import { lazy } from 'react';

import { Route } from '/js/utils/router';

const NotFound = lazy(() => import('/js/pages/404'));
const Forbidden = lazy(() => import('/js/pages/403'));
const ServerError = lazy(() => import('/js/pages/500'));
const Layout = lazy(() => import('/js/components/Layout'));

export const routes: Route<{ id?: number }>[] = [
  {
    path: '/404',
    element: <NotFound />,
    meta: {
      hideInMenu: true,
      hideInBreadcrumb: true
    }
  },
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
    element: <Layout />,
    meta: {
      name: 'Layout',
      hideInMenu: true,
      hideInBreadcrumb: true
    },
    children: [
      {
        path: '/news',
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