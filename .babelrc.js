/**
 * @module .babelrc
 * @listens MIT
 * @author nuintun
 * @description Babel configure.
 */

'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
        targets: { browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'] }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    ['import', { style: true, libraryName: 'antd', libraryDirectory: 'es' }],
    ['@babel/plugin-transform-runtime', { polyfill: false, regenerator: true }]
  ],
  env: {
    development: {
      presets: [['@babel/preset-react', { development: true, useBuiltIns: true }]],
      plugins: ['react-hot-loader/babel']
    },
    production: {
      presets: [['@babel/preset-react', { useBuiltIns: true }]],
      plugins: [['transform-react-remove-prop-types', { removeImport: true }]]
    }
  }
};
