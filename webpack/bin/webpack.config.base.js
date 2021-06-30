/**
 * @module webpack.config.base
 * @listens MIT
 * @author nuintun
 * @description Webpack base configure.
 */

'use strict';

const mode = process.env.NODE_ENV;

process.env.BABEL_ENV = mode;

const webpack = require('webpack');
const pkg = require('../../package.json');
const configure = require('../configure');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const progress = {
  percentBy: 'entries'
};

const env = {
  __DEV__: mode !== 'production',
  __APP_TITLE__: JSON.stringify(configure.title)
};

const clean = {
  cleanOnceBeforeBuildPatterns: ['**/*', configure.entryHTML]
};

const html = {
  xhtml: true,
  minify: true,
  title: configure.title,
  favicon: configure.favicon,
  filename: configure.entryHTML,
  template: require.resolve('../template/index.ejs')
};

module.exports = {
  name: pkg.name,
  entry: configure.entry,
  output: {
    pathinfo: false,
    path: configure.outputPath,
    publicPath: configure.publicPath
  },
  resolve: {
    alias: configure.alias,
    fallback: { url: false },
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      theme: [configure.theme]
    }
  },
  stats: {
    hash: false,
    colors: true,
    builtAt: false,
    timings: false,
    version: false,
    modules: false,
    children: false,
    entrypoints: false
  },
  performance: {
    hints: false
  },
  optimization: {
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    removeAvailableModules: true,
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new CaseSensitivePathsPlugin(),
    new webpack.ProgressPlugin(progress),
    new CleanWebpackPlugin(clean),
    new webpack.DefinePlugin(env),
    new HtmlWebpackPlugin(html)
  ],
  module: {
    strictExportPresence: true,
    noParse: configure.noParse
  }
};
