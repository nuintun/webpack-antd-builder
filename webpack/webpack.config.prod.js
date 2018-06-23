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
const configure = require('./webpack.config.base');
const { entry, entryBasePath } = require('./configure');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackEntryManifestPlugin = require('webpack-entry-manifest-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const mode = 'production';
const watcher = globEntry(entry, entryBasePath);

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.bail = true;
configure.devtool = 'none';
configure.entry = watcher.entries();
configure.output = Object.assign(configure.output, {
  filename: 'js/[chunkhash].js',
  chunkFilename: 'js/[chunkhash].js'
});
configure.plugins = [
  watcher,
  ...configure.plugins,
  new webpack.EnvironmentPlugin({ DEBUG: false, NODE_ENV: mode }),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 256 * 1024 }),
  new MiniCssExtractPlugin({ filename: 'css/[chunkhash].css' }),
  new WebpackEntryManifestPlugin({ serialize: manifest => JSON.stringify(manifest) }),
  new HardSourceWebpackPlugin({ info: { mode: 'none', level: 'warn' } })
];
configure.module.rules = loaders();
configure.optimization.minimizer = [
  new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: false }),
  new OptimizeCSSAssetsPlugin({ cssProcessorOptions: { reduceIdents: false } })
];

module.exports = configure;
