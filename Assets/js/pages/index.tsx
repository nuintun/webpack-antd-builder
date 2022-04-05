import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app');
const root = createRoot(app as HTMLDivElement);

root.render(<App />);

if (__DEV__) {
  if (module.hot) {
    module.hot.accept(['./App.tsx'], () => {
      root.render(<App />);
    });
  }
}
