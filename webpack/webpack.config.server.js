/**
 * @module webpack.config.server
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpackDevServer.config.js
 */

'use strict';

const webpack = require('webpack');
const loaders = require('./lib/loaders');
const globEntry = require('./lib/entry');
const getLocalExternalIP = require('./lib/ip');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackEntryManifestPlugin = require('webpack-entry-manifest-plugin');
const { entry, stats, entryBasePath, publicPath, outputPath } = require('./configure');

const port = 9000;
const mode = 'development';
const ip = getLocalExternalIP();
const devServerPublicPath = `http://${ip}:${port}${publicPath}`;
const watcher = globEntry(entry, entryBasePath, [
  `webpack-dev-server/client?http://0.0.0.0:${port}`,
  'webpack/hot/only-dev-server'
]);

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.stats = 'none';
configure.devtool = 'none';
configure.entry = watcher.entries();
configure.output = Object.assign(configure.output, {
  filename: 'js/[name].js',
  chunkFilename: 'js/[name].js',
  publicPath: devServerPublicPath
});
configure.plugins = [
  watcher,
  ...configure.plugins,
  new webpack.EnvironmentPlugin({ DEBUG: true, NODE_ENV: mode }),
  new webpack.NamedChunksPlugin(),
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
  new WebpackEntryManifestPlugin({ map: (file, chunk) => `${file}?v=${chunk.hash}` }),
  new webpack.SourceMapDevToolPlugin({ exclude: /[\\/](runtime|react|antd|vendor-[^\\/]+)\.(js|css)$/i })
];
configure.module.rules = loaders(true);
configure.devServer = {
  port,
  stats,
  hot: true,
  inline: true,
  quiet: false,
  compress: true,
  overlay: false,
  host: '0.0.0.0',
  clientLogLevel: 'none',
  watchContentBase: true,
  contentBase: outputPath,
  publicPath: devServerPublicPath,
  historyApiFallback: { disableDotRule: true },
  watchOptions: { ignored: 'node_modules/**/*' },
  headers: { 'Access-Control-Allow-Origin': '*' }
};

module.exports = configure;
