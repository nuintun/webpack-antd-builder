/**
 * @module happypack
 * @listens MIT
 * @author nuintun
 * @description HappyPack loaders
 */

'use strict';

const os = require('os');
const theme = require('../theme');
const HappyPack = require('happypack');

const verbose = false;
const localIdentName = '[local]--[hash:base64:5]';
const sourceMap = process.env.NODE_ENV !== 'production';
const threadPool = HappyPack.ThreadPool({ size: os.cpus().length });

module.exports = [
  new HappyPack({
    id: 'js',
    verbose,
    threadPool,
    loaders: [{ loader: 'babel-loader', options: { highlightCode: true, cacheDirectory: true } }]
  }),
  new HappyPack({
    id: 'css',
    verbose,
    threadPool,
    loaders: [
      { loader: 'css-loader', options: { sourceMap, importLoaders: 1 } },
      { loader: 'postcss-loader', options: { sourceMap } }
    ]
  }),
  new HappyPack({
    id: 'css-module',
    verbose,
    threadPool,
    loaders: [
      { loader: 'css-loader', options: { modules: true, sourceMap, localIdentName, importLoaders: 1 } },
      { loader: 'postcss-loader', options: { sourceMap } }
    ]
  }),
  new HappyPack({
    id: 'less',
    verbose,
    threadPool,
    loaders: [
      { loader: 'css-loader', options: { sourceMap, importLoaders: 2 } },
      { loader: 'postcss-loader', options: { sourceMap } },
      { loader: 'less-loader', options: { modifyVars: theme, sourceMap, javascriptEnabled: true } }
    ]
  }),
  new HappyPack({
    id: 'less-module',
    verbose,
    threadPool,
    loaders: [
      { loader: 'css-loader', options: { modules: true, sourceMap, localIdentName, importLoaders: 2 } },
      { loader: 'postcss-loader', options: { sourceMap } },
      { loader: 'less-loader', options: { modifyVars: theme, sourceMap, javascriptEnabled: true } }
    ]
  })
];
