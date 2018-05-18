/**
 * @module webpack.config.dev
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.dev.js
 */

'use strict';

const webpack = require('webpack');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackManifestPlugin = require('@nuintun/webpack-manifest-plugin');

const WebpackEntryManifestPlugin = require('./test');

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.devtool = 'none';
configure.output = Object.assign(configure.output || {}, {
  filename: 'js/[name].js',
  chunkFilename: 'js/[name].js'
});
configure.plugins = [
  ...(configure.plugins || []),
  new webpack.EnvironmentPlugin({
    DEBUG: true,
    NODE_ENV: mode
  }),
  new webpack.SourceMapDevToolPlugin({
    exclude: /[\\/](?:react|antd|vendors|runtime)\.(?:js|css)$/i
  }),
  new WebpackEntryManifestPlugin(),
  new MiniCssExtractPlugin({ filename: 'css/[name].css' })
];
configure.watchOptions = Object.assign(configure.watchOptions || {}, { ignored: 'node_modules/**/*' });

module.exports = configure;
