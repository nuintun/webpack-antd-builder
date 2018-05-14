/**
 * @module webpack.config.prod
 * @author nuintun
 */

'use strict';

const webpack = require('webpack');
const configure = require('./webpack.config.base');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackManifestPlugin = require('@nuintun/webpack-manifest-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

configure.devtool = 'none';
configure.mode = 'production';
configure.output = Object.assign(configure.output || {}, {
  filename: 'js/[chunkhash].js',
  chunkFilename: 'js/[chunkhash].js'
});
configure.plugins = [
  ...(configure.plugins || []),
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
    parallel: false,
    sourceMap: false
  }),
  new OptimizeCSSAssetsPlugin()
];

module.exports = configure;
