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
const configure = require('./configure');

const verbose = false;
const context = configure.context;
const development = process.env.NODE_ENV !== 'production';
const threadPool = HappyPack.ThreadPool({ size: os.cpus().length });

module.exports = [
  new HappyPack({
    id: 'js',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'babel-loader',
        options: {
          highlightCode: true,
          cacheDirectory: true
        }
      }
    ]
  }),
  new HappyPack({
    id: 'css',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'css-loader',
        options: {
          sourceMap: development
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: development
        }
      }
    ]
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
          sourceMap: development,
          localIdentName: '[local]___[hash:base64:5]'
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: development
        }
      }
    ]
  }),
  new HappyPack({
    id: 'less',
    verbose,
    threadPool,
    loaders: [
      {
        loader: 'css-loader',
        options: {
          sourceMap: development
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: development
        }
      },
      {
        loader: 'less-loader',
        options: {
          modifyVars: theme,
          sourceMap: development,
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
          sourceMap: development,
          localIdentName: '[local]___[hash:base64:5]'
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: development
        }
      },
      {
        loader: 'less-loader',
        options: {
          modifyVars: theme,
          sourceMap: development,
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
