/**
 * @module webpack.config.prod
 * @listens MIT
 * @author nuintun
 * @description Webpack production configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.prod.js
 */

'use strict';

const webpack = require('webpack');
const configure = require('./webpack.config.base');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackManifestPlugin = require('@nuintun/webpack-manifest-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.bail = true;
configure.devtool = 'none';
configure.output = Object.assign(configure.output || {}, {
  filename: 'js/[chunkhash].js',
  chunkFilename: 'js/[chunkhash].js'
});
configure.plugins = [
  ...(configure.plugins || []),
  new webpack.EnvironmentPlugin({
    DEBUG: false,
    NODE_ENV: mode
  }),
  new WebpackManifestPlugin({
    filter: module => !module.isAsset
  }),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new MiniCssExtractPlugin({ filename: 'css/[chunkhash].css' })
];
configure.optimization.minimizer = [
  ...(configure.optimization.minimizer || []),
  new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: false
  }),
  new OptimizeCSSAssetsPlugin()
];

module.exports = configure;
