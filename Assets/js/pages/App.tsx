/**
 * @module App
 */

import '/css/global.less';

import { lazy, memo, Suspense, useMemo } from 'react';

import { Button, Result } from 'antd';
import { parse } from '/js/utils/router';
import { router } from '/js/config/router';
import { Router } from 'react-nest-router';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

const NotFound = lazy(() => import('/js/pages/404'));

const ErrorFallback = memo(function ErrorFallback({ resetErrorBoundary, error }: FallbackProps) {
  if (__DEV__) {
    return (
      <Result
        status="error"
        title="页面错误"
        extra={
          <Button type="primary" onClick={resetErrorBoundary}>
            重试页面
          </Button>
        }
        subTitle={
          <div style={{ display: 'flex', margin: '24px 0 0', justifyContent: 'center' }}>
            <pre style={{ fontFamily: 'monospace', color: '#f00', padding: 0, margin: 0, textAlign: 'left' }}>
              {error.stack}
            </pre>
          </div>
        }
      />
    );
  }

  return (
    <Result
      status="error"
      title="页面错误"
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          重试页面
        </Button>
      }
      subTitle="抱歉，发生错误，无法渲染页面，请联系系统管理员或者重试页面！"
    />
  );
});

const Page = memo(function Page() {
  const routes = useMemo(() => {
    return parse(router);
  }, [router]);

  return (
    <Suspense fallback={<SuspenseFallBack />}>
      <Router routes={routes} context={routes}>
        <NotFound />
      </Router>
    </Suspense>
  );
});

export default memo(function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Page />
    </ErrorBoundary>
  );
});
