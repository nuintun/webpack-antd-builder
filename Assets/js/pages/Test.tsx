/**
 * @module App
 */

import '/css/global.scss';

import { memo } from 'react';

import { Button, ConfigProvider, Result } from 'antd';
import { useStyleSheets } from '../hooks/useStyleSheets';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

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
  const [namespace, render] = useStyleSheets('flex-menu', token => {
    return {
      '.flex-menu': {
        margin: 0,
        padding: 0,
        color: token.colorPrimary,
        '> p': {
          margin: 0,
          padding: 0,
          background: token.colorBgContainer
        }
      }
    };
  });

  return render(
    <div className={namespace}>
      <p className="a">App</p>
    </div>
  );
});

export default memo(function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#8daa32'
        }
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Page />
      </ErrorBoundary>
    </ConfigProvider>
  );
});
