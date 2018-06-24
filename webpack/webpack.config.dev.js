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
const { getConfigHash } = require('./lib/utils');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackEntryManifestPlugin = require('webpack-entry-manifest-plugin');
const { entry, entryBasePath, sourceMapExclude, watchOptions } = require('./configure');

const mode = 'development';
const watcher = globEntry(entry, entryBasePath);
const configHash = getConfigHash(require.resolve('./webpack.config.dev.js'));

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
  new WebpackEntryManifestPlugin({ map: (file, chunk) => `${file}?v=${chunk.hash}` }),
  new HardSourceWebpackPlugin({ configHash, info: { mode: 'none', level: 'warn' } })
];
configure.module.rules = loaders();
configure.watchOptions = watchOptions;

module.exports = configure;
