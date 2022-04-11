import App from './App';
import { createRoot } from 'react-dom/client';
import { on } from 'webpack-dev-server-middleware/client';

const app = document.getElementById('app');
const root = createRoot(app as HTMLDivElement);

root.render(<App />);

if (__DEV__) {
  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(['./App.tsx'], () => {
      root.render(<App />);
    });
  }

  on('ok', ({ builtAt }) => {
    console.info(
      `%c⭕%c[HMR]: App is up to date at ${new Date(builtAt).toLocaleString()}`,
      'color: #f92f60; font-weight: normal;',
      'color: #1890ff; font-weight: bold;'
    );
  });
}
