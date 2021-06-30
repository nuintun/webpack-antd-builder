/**
 * @module webpack.config.server
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpackDevServer.config.js
 */

'use strict';

const mode = 'development';

process.env.NODE_ENV = mode;

const fs = require('fs');
const Koa = require('koa');
const webpack = require('webpack');
const resolveIp = require('../lib/ip');
const querystring = require('querystring');
const koaCompress = require('koa-compress');
const findPorts = require('find-free-ports');
const resolveRules = require('../lib/rules');
const configure = require('./webpack.config.base');
const devMiddleware = require('../middleware/dev');
const hotMiddleware = require('../middleware/hot');
const { publicPath, entryHTML } = require('../configure');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { toString } = Object.prototype;

function isTypeof(value, type) {
  return toString.call(value).toLowerCase() === `[object ${type.toLowerCase()}]`;
}

async function resolvePort(startPort = 8000, endPort = 9000) {
  const [port] = await findPorts(1, { startPort, endPort });

  return port;
}

function httpError(error) {
  return /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i.test(error.code);
}

function injectHotEntry(entry, options) {
  const params = { reload: true, quiet: true, noInfo: true, ...options };
  const hotEntry = `webpack-hot-middleware/client?${querystring.stringify(params)}`;

  if (Array.isArray(entry)) {
    return [hotEntry, ...entry];
  }

  if (isTypeof(entry, 'string')) {
    return [hotEntry, entry];
  }

  return entry;
}

async function resolveEntry(entry, options) {
  if (typeof entry === 'function') entry = entry();

  if (typeof entry === 'function') entry = await entry();

  if (isTypeof(entry, 'object')) {
    const entries = {};
    const entryIterable = Object.entries(entry);

    for (const [name, entry] of entryIterable) {
      if (isTypeof(entry, 'object')) {
        entries[name] = { ...entry, import: injectHotEntry(entry.import, options) };
      } else {
        entries[name] = injectHotEntry(entry, options);
      }
    }

    return entries;
  }

  return injectHotEntry(entry, options);
}

(async () => {
  const ip = await resolveIp();
  const port = await resolvePort();
  const devServerHost = `http://${ip}:${port}`;
  const devServerPublicPath = devServerHost + publicPath;
  const entry = await resolveEntry(configure.entry, { path: `${devServerHost}/webpack-hmr` });
  const css = { ignoreOrder: true, filename: 'css/[name].css', chunkFilename: 'css/chunk-[id].css' };

  configure.mode = mode;
  configure.entry = entry;
  configure.output = {
    ...configure.output,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
    publicPath: devServerPublicPath
  };
  configure.plugins = [
    ...configure.plugins,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.SourceMapDevToolPlugin(),
    new MiniCssExtractPlugin(css)
  ];
  configure.module.rules = await resolveRules(mode);
  configure.devtool = 'eval-cheap-module-source-map';
  configure.cache.name = `${configure.name}-${configure.mode}-server`;

  const app = new Koa();
  const compiler = webpack(configure);
  const logger = compiler.getInfrastructureLogger('webpack-dev-middleware');

  app.use(koaCompress());

  app.use(
    hotMiddleware(compiler, {
      log: false,
      path: '/webpack-hmr'
    })
  );

  const devServer = devMiddleware(compiler, {
    index: false,
    writeToDisk: file => file === entryHTML,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  });

  devServer.waitUntilValid(() => {
    logger.info(`server run at: \u001B[36m${devServerHost}\u001B[0m`);
  });

  app.use(devServer);

  app.use(async ctx => {
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = fs.createReadStream(entryHTML);
  });

  app.on('error', error => {
    !httpError(error) && console.error(error);
  });

  app.listen(port);
})();
