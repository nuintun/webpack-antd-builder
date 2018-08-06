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
        targets: { browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 10', 'iOS >= 8', 'Android >= 4'] }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-runtime', { regenerator: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    ['import', { style: true, libraryName: 'antd', libraryDirectory: 'es' }]
  ],
  env: {
    development: {
      presets: [['@babel/preset-react', { development: true, useBuiltIns: true }]]
    },
    production: {
      presets: [['@babel/preset-react', { useBuiltIns: true }]],
      plugins: [['transform-react-remove-prop-types', { removeImport: true }]]
    }
  }
};
