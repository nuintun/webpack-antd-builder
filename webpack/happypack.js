/**
 * @module happypack
 * @author nuintun
 */

'use strict';

const os = require('os');
const theme = require('../theme');
const HappyPack = require('happypack');
const configure = require('./configure');

const verbose = false;
const context = configure.context;
const threadPool = HappyPack.ThreadPool({ size: os.cpus().length });

module.exports = [
  new HappyPack({
    id: 'js',
    verbose,
    threadPool,
    verboseWhenProfiling: true,
    loaders: ['babel-loader']
  }),
  new HappyPack({
    id: 'css',
    verbose,
    threadPool,
    loaders: ['css-loader', 'postcss-loader']
  }),
  new HappyPack({
    id: 'css-module',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'css-loader',
        options: {
          modules: true,
          localIdentName: '[local]___[hash:base64:5]'
        }
      },
      'postcss-loader'
    ]
  }),
  new HappyPack({
    id: 'less',
    verbose,
    threadPool,
    loaders: [
      'css-loader',
      'postcss-loader',
      {
        loader: 'less-loader',
        options: {
          modifyVars: theme,
          javascriptEnabled: true
        }
      }
    ]
  }),
  new HappyPack({
    id: 'less-module',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'css-loader',
        options: {
          modules: true,
          localIdentName: '[local]___[hash:base64:5]'
        }
      },
      'postcss-loader',
      {
        loader: 'less-loader',
        options: {
          modifyVars: theme,
          javascriptEnabled: true
        }
      }
    ]
  }),
  new HappyPack({
    id: 'font',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'url-loader',
        options: {
          context,
          limit: 8192,
          emitFile: false,
          name: '[path][name].[ext]?[hash]'
        }
      }
    ]
  }),
  new HappyPack({
    id: 'svg',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'url-loader',
        options: {
          context,
          limit: 8192,
          emitFile: false,
          name: '[path][name].[ext]?[hash]'
        }
      }
    ]
  }),
  new HappyPack({
    id: 'image',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'url-loader',
        options: {
          context,
          limit: 8192,
          emitFile: false,
          name: '[path][name].[ext]?[hash]'
        }
      }
    ]
  })
];
