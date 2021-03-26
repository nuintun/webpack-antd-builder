/**
 * @module .babelrc
 * @listens MIT
 * @author nuintun
 * @description Babel configure.
 */

'use strict';

const browsers = require('./package.json').browserslist;

const development = process.env.BABEL_ENV !== 'production';

module.exports = {
  presets: [
    ['@babel/preset-env', { bugfixes: true, corejs: 3, useBuiltIns: 'usage', targets: { browsers } }],
    ['@babel/preset-react', { runtime: 'automatic', useBuiltIns: true, development }],
    ['@babel/preset-typescript', { allowDeclareFields: true }]
  ],
  plugins: [
    ['import', { style: true, libraryName: 'antd', libraryDirectory: 'es' }],
    ['@babel/plugin-transform-runtime', { useESModules: true }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
};
