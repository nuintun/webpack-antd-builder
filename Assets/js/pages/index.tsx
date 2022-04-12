/**
 * @module index
 */

import App from './App';
import { render } from 'react-dom';

const app = document.getElementById('app');

render(<App />, app);

if (__DEV__) {
  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(['./App.tsx'], () => {
      render(<App />, app);
    });

    import(
      // webpackMode: 'eager'
      'webpack-dev-server-middleware/client'
    ).then(({ on }) => {
      on('ok', ({ builtAt }) => {
        console.log(`[HMR] App is up to date at ${new Date(builtAt).toLocaleString()}`);
      });
    });
  }
}
