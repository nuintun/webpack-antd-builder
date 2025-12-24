/**
 * @module App
 */

import '/css/global.scss';

import { router } from '/js/router';
import { parse } from '/js/utils/router';
import useTheme from '/js/hooks/useTheme';
import { Router } from 'react-nest-router';
import { App, ConfigProvider, theme } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import { lazy, memo, Suspense, useMemo } from 'react';
import ErrorFallback from '/js/components/Fallback/Error';
import LoadingFallback from '/js/components/Fallback/Loading';

const NotFound = lazy(() => import('/js/pages/404'));

const { useToken, darkAlgorithm, defaultAlgorithm } = theme;

const Page = memo(function Page() {
  const { token } = useToken();
  const { colorBgContainer } = token;
  const routes = useMemo(() => parse(router), [router]);

  return (
    <App className="ui-app" style={{ backgroundColor: colorBgContainer }} message={{ maxCount: 3 }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <Router routes={routes} context={routes}>
            <NotFound />
          </Router>
        </Suspense>
      </ErrorBoundary>
    </App>
  );
});

export default memo(function App() {
  const [theme] = useTheme();

  return (
    <ConfigProvider
      theme={{
        hashed: false,
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm
      }}
    >
      <Page />
    </ConfigProvider>
  );
});
