/**
 * @module webpack.config.server
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpackDevServer.config.js
 */

'use strict';

const fs = require('fs');
const koa = require('koa');
const crypto = require('crypto');
const webpack = require('webpack');
const pkg = require('../package.json');
const loaders = require('./lib/loaders');
const globEntry = require('./lib/entry');
const koaWebpack = require('koa-webpack');
const koaCompress = require('koa-compress');
const getLocalExternalIP = require('./lib/ip');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackEntryManifestPlugin = require('webpack-entry-manifest-plugin');
const { entry, entryBasePath, publicPath, sourceMapExclude, watchOptions } = require('./configure');

const md5 = crypto.createHash('sha256');

md5.update(fs.readFileSync(require.resolve('./webpack.config.server')));

const app = new koa();
const mode = 'development';
const configHash = md5.digest('hex');

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

app.use(koaCompress());

const server = app.listen(() => {
  const ip = getLocalExternalIP();
  const port = server.address().port;
  const devServerHost = `//${ip}:${port}`;
  const devServerPublicPath = devServerHost + publicPath;
  const watcher = globEntry(entry, entryBasePath, ['webpack-hot-client/client']);

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
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new webpack.SourceMapDevToolPlugin({ exclude: sourceMapExclude }),
    new WebpackEntryManifestPlugin({
      filter: file => !/[^\\/]+\.hot-update\.js/i.test(file),
      map: (file, chunk) => `${file}?v=${chunk.hash}`
    }),
    new HardSourceWebpackPlugin({ configHash, info: { mode: 'none', level: 'warn' } }),
    new HardSourceWebpackPlugin.ExcludeModulePlugin([{ test: /[\\/]webpack-hot-client[\\/]client[\\/]/i }])
  ];
  configure.module.rules = loaders(true);

  const compiler = webpack(configure);

  compiler.name = pkg.name;

  koaWebpack({
    compiler,
    hotClient: {
      host: ip,
      logLevel: 'silent'
    },
    devMiddleware: {
      logLevel: 'silent',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      watchOptions
    }
  }).then(middleware => {
    app.use(middleware);
  });
});
