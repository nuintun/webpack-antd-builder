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
    console.info(`📌 %c[HMR]: App is up to date at ${new Date(builtAt).toLocaleString()}.`, `color: #099160;`);
  });
}
