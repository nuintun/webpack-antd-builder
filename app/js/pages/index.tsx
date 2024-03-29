/**
 * @module index
 */

import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app');
const root = createRoot(app as HTMLDivElement);

root.render(<App />);

if (__DEV__) {
  if (import.meta.webpackHot) {
    import(
      // webpackMode: 'eager'
      'webpack-dev-service/client'
    ).then(({ on }) => {
      on('ok', ({ timestamp }) => {
        console.log(`[HMR] App is up to date at ${new Date(timestamp).toLocaleString()}`);
      });
    });
  }
}
