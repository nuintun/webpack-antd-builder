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
        modules: false,
        useBuiltIns: 'entry',
        targets: {
          browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4']
        }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-destructuring',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-regenerator', { async: false }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    ['import', { style: true, libraryName: 'antd', libraryDirectory: 'es' }],
    ['@babel/plugin-transform-runtime', { helpers: false, polyfill: false, regenerator: true }]
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
