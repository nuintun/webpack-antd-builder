/**
 * @module polyfills
 * @listens MIT
 * @author nuintun
 * @description Polyfills
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.dev.js
 */

'use strict';

// Rejection tracking prevents a common issue where React gets into an
// inconsistent state due to an error, but it gets swallowed by a Promise,
// and the user has no idea what causes React's erratic future behavior.
require('@nuintun/promise');

// fetch() polyfill for making API calls.
require('@nuintun/fetch');
