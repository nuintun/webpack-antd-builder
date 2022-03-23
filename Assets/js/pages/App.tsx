/**
 * @module App
 */

import { render } from 'react-dom';

import { parse } from '/js/utils/router';
import { routes } from '/js/config/router';

function App() {
  console.log(parse(routes));

  return null;
}

if (__DEV__) {
  module.hot && module.hot.accept();
}

render(<App />, document.getElementById('root'));
