/**
 * @module router
 */

import { lazy } from 'react';

import { Route } from '/js/utils/router';

const NotFound = lazy(() => import('/js/pages/404'));
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
    element: <Layout />,
    meta: {
      name: 'Layout',
      hideInMenu: true,
      hideInBreadcrumb: true
    },
    children: [
      {
        path: '/news',
        element: 'News',
        meta: {
          name: 'News',
          link: {
            target: '_blank'
          }
        },
        children: [
          {
            path: 'sport',
            element: 'sport',
            meta: { name: 'Sport' }
          }
        ]
      }
    ]
  }
];
