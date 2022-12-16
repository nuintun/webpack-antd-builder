/**
 * @module App
 */

import '/css/global.scss';

import React, { lazy, memo, Suspense, useMemo } from 'react';

import useTheme from '../hooks/useTheme';
import { parse } from '/js/utils/router';
import { Router } from 'react-nest-router';
import { router } from '/js/config/router';
import { Provider } from '/js/hooks/useMessage';
import SuspenseFallBack from '/js/components/SuspenseFallBack';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button, ConfigProvider, message, Result, theme } from 'antd';

const { useToken } = theme;

const { useMessage } = message;

const { darkAlgorithm, defaultAlgorithm } = theme;

const NotFound = lazy(() => import('/js/pages/404'));

const ErrorFallback = memo(function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
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
              {error.stack?.replace(/(\r?\n)\s{2,}/gm, '$1  ') || error.message}
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
  const { token } = useToken();
  const { colorBgContainer } = token;
  const routes = useMemo(() => parse(router), [router]);
  const [message, context] = useMessage({ maxCount: 3 });

  const pageStyle = useMemo<React.CSSProperties>(() => {
    return {
      width: '100%',
      height: '100%',
      backgroundColor: colorBgContainer
    };
  }, [colorBgContainer]);

  return (
    <Provider value={message}>
      {context}
      <div style={pageStyle}>
        <Suspense fallback={<SuspenseFallBack />}>
          <Router routes={routes} context={routes}>
            <NotFound />
          </Router>
        </Suspense>
      </div>
    </Provider>
  );
});

export default memo(function App() {
  const [theme] = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: [theme === 'dark' ? darkAlgorithm : defaultAlgorithm]
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Page />
      </ErrorBoundary>
    </ConfigProvider>
  );
});
