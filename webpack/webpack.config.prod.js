/**
 * @module webpack.config.prod
 * @listens MIT
 * @author nuintun
 * @description Webpack production configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.prod.js
 */

'use strict';

const webpack = require('webpack');
const loaders = require('./lib/loaders');
const globEntry = require('./lib/entry');
const { getConfigHash } = require('./lib/utils');
const configure = require('./webpack.config.base');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { entry, entryBasePath, recordsPath } = require('./configure');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackEntryManifestPlugin = require('webpack-entry-manifest-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const mode = 'production';
const watcher = globEntry(entry, entryBasePath);
const configHash = getConfigHash(require.resolve('./webpack.config.prod.js'));

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.bail = true;
configure.devtool = 'none';
configure.entry = watcher.entries();
configure.recordsPath = recordsPath;
configure.output = Object.assign(configure.output, {
  filename: 'js/[chunkhash].js',
  chunkFilename: 'js/[chunkhash].js'
});
configure.plugins = [
  watcher,
  ...configure.plugins,
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.optimize.OccurrenceOrderPlugin(true),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.EnvironmentPlugin({ DEBUG: false, NODE_ENV: mode }),
  new MiniCssExtractPlugin({ filename: 'css/[chunkhash].css' }),
  new WebpackEntryManifestPlugin({ serialize: manifest => JSON.stringify(manifest) }),
  new HardSourceWebpackPlugin({ configHash, info: { mode: 'none', level: 'warn' } })
];
configure.module.rules = loaders();
configure.optimization.minimizer = [
  new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: false }),
  new OptimizeCSSAssetsPlugin({ cssProcessorOptions: { reduceIdents: false } })
];

module.exports = configure;
