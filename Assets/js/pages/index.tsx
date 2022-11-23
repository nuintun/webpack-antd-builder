/**
 * @module index
 */

import App from './Test';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app');
const root = createRoot(app as HTMLDivElement);

root.render(<App />);

if (__DEV__) {
  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(['./Test.tsx'], () => {
      root.render(<App />);
    });

    import(
      // webpackMode: 'eager'
      'koa-webpack-dev-service/client'
    ).then(({ on }) => {
      on('ok', ({ builtAt }) => {
        console.log(`[HMR] App is up to date at ${new Date(builtAt).toLocaleString()}`);
      });
    });
  }
}
