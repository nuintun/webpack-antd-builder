/**
 * @module App
 */

import { render } from 'react-dom';
import { lazy, Suspense } from 'react';

import { parse } from '/js/utils/router';
import { Router } from 'react-nest-router';
import * as router from '/js/config/router';
import SuspenseFallBack from '/js/components/SuspenseFallBack';

const [routes] = parse(router.routes);
const NotFound = lazy(() => import('/js/pages/404'));

function App() {
  return (
    <Suspense fallback={<SuspenseFallBack />}>
      <Router routes={routes}>
        <NotFound />
      </Router>
    </Suspense>
  );
}

if (__DEV__) {
  module.hot && module.hot.accept();
}

render(<App />, document.getElementById('root'));
