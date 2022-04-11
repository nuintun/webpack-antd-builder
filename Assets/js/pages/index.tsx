/**
 * @module index
 */

import App from './App';
import { render } from 'react-dom';
import { on } from 'webpack-dev-server-middleware/client';

const app = document.getElementById('app');

render(<App />, app);

if (__DEV__) {
  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(['./App.tsx'], () => {
      render(<App />, app);
    });
  }

  on('ok', ({ builtAt }) => {
    console.log(`[HMR] App is up to date at ${new Date(builtAt).toLocaleString()}`);
  });
}
