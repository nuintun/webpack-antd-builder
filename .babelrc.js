/**
 * @module .babelrc
 * @description Babel 配置
 */

'use strict';

const browsers = require('./package.json').browserslist;

const targets = { browsers };
const corejs = { version: '^3.0.0', proposals: true };
const development = process.env.BABEL_ENV !== 'production';
const imports = { style: true, libraryName: 'antd', libraryDirectory: 'es' };

module.exports = {
  presets: [
    ['@babel/preset-env', { bugfixes: true, corejs, useBuiltIns: 'usage', targets }],
    ['@babel/preset-react', { runtime: 'automatic', development }],
    ['@babel/preset-typescript', { optimizeConstEnums: true }]
  ],
  plugins: [
    ['import', imports],
    ['@babel/plugin-transform-runtime', { corejs: false }],
    ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: false }]
  ]
};
