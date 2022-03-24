/**
 * @module App
 */

import '/css/global.less';

import { render } from 'react-dom';
import { lazy, Suspense, useMemo } from 'react';

import { parse } from '/js/utils/router';
import { Router } from 'react-nest-router';
import * as router from '/js/config/router';
import SuspenseFallBack from '/js/components/SuspenseFallBack';

const [routes, menus] = parse(router.routes);
const NotFound = lazy(() => import('/js/pages/404'));

function App() {
  const context = useMemo(() => {
    return { menus };
  }, [menus]);

  return (
    <Suspense fallback={<SuspenseFallBack />}>
      <Router routes={routes} context={context}>
        <NotFound />
      </Router>
    </Suspense>
  );
}

if (__DEV__) {
  module.hot && module.hot.accept();
}

render(<App />, document.getElementById('root'));
