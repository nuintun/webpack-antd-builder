/**
 * @module webpack.config.prod
 * @author nuintun
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const configure = require('./webpack.config.base');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

configure.mode = 'production';
configure.output = {
  publicPath: '/Assets/dist/',
  filename: 'js/[chunkhash].js',
  chunkFilename: 'js/[chunkhash].js',
  path: path.resolve('Assets/dist')
};
configure.plugins.push(
  new webpack.optimize.ModuleConcatenationPlugin(),
  new MiniCssExtractPlugin({ filename: 'css/[chunkhash].css' })
);
configure.optimization.minimizer = [
  new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: false
  }),
  new OptimizeCSSAssetsPlugin()
];

module.exports = configure;
