/**
 * @module App
 */

import '/css/global.less';

import { render } from 'react-dom';
import { lazy, memo, Suspense, useMemo } from 'react';

import { Button, Result } from 'antd';
import { parse } from '/js/utils/router';
import { router } from '/js/config/router';
import { Router } from 'react-nest-router';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

const NotFound = lazy(() => import('/js/pages/404'));

const ErrorFallback = memo(function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
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
        subTitle="抱歉，发生错误，无法渲染页面，请打开开发者工具查看错误信息！"
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

function App() {
  const [routes, menus] = useMemo(() => {
    return parse(router);
  }, [router]);

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

render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')
);
