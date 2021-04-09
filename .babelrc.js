/**
 * @module .babelrc
 * @listens MIT
 * @author nuintun
 * @description Babel configure.
 */

'use strict';

const browsers = require('./package.json').browserslist;

const corejs = { version: '^3.0.0', proposals: true };
const development = process.env.BABEL_ENV !== 'production';
const imports = { style: true, libraryName: 'antd', libraryDirectory: 'es' };

module.exports = {
  presets: [
    ['@babel/preset-env', { bugfixes: true, corejs, useBuiltIns: 'usage', targets: { browsers } }],
    ['@babel/preset-react', { runtime: 'automatic', useBuiltIns: true, development }],
    ['@babel/preset-typescript', { allowDeclareFields: true }]
  ],
  plugins: [
    ['import', imports],
    ['@babel/plugin-transform-runtime', { corejs: false }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
};
