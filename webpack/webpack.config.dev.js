/**
 * @module webpack.config.dev
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.dev.js
 */

'use strict';

const webpack = require('webpack');
const loaders = require('./lib/loaders');
const globEntry = require('./lib/entry');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { entry, entryBasePath, sourceMapExclude } = require('./configure');
const WebpackEntryManifestPlugin = require('webpack-entry-manifest-plugin');

const mode = 'development';
const watcher = globEntry(entry, entryBasePath);

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.devtool = 'none';
configure.entry = watcher.entries();
configure.output = Object.assign(configure.output, {
  filename: 'js/[name].js',
  chunkFilename: 'js/[name].js'
});
configure.plugins = [
  watcher,
  ...configure.plugins,
  new webpack.EnvironmentPlugin({ DEBUG: true, NODE_ENV: mode }),
  new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
  new webpack.SourceMapDevToolPlugin({ exclude: sourceMapExclude }),
  new WebpackEntryManifestPlugin({ map: (file, chunk) => `${file}?v=${chunk.hash}` })
];
configure.module.rules = loaders();

module.exports = configure;
