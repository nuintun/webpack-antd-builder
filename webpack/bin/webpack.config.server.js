/**
 * @module webpack.config.server
 * @listens MIT
 * @author nuintun
 * @description Webpack development server configure
 * @see https://github.com/facebook/create-react-app
 */

'use strict';

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

const Koa = require('koa');
const path = require('path');
const memfs = require('memfs');
const webpack = require('webpack');
const resolveIp = require('../lib/ip');
const { URLSearchParams } = require('url');
const koaCompress = require('koa-compress');
const { findFreePorts } = require('find-free-ports');
const resolveConfigure = require('./webpack.config.base');
const { publicPath, entryHTML } = require('../configure');
const devMiddleware = require('webpack-dev-server-middleware');

const { toString } = Object.prototype;

function createMemfs() {
  const volume = new memfs.Volume();
  const fs = memfs.createFsFromVolume(volume);

  fs.join = path.join.bind(path);

  return fs;
}

function isTypeof(value, type) {
  return toString.call(value).toLowerCase() === `[object ${type.toLowerCase()}]`;
}

async function resolvePort(startPort = 8000, endPort = 9000) {
  const [port] = await findFreePorts(1, { startPort, endPort });

  return port;
}

function httpError(error) {
  return /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i.test(error.code);
}

function injectHotEntry(entry, options) {
  const params = new URLSearchParams(options);
  const hotEntry = `webpack-dev-server-middleware/client?${params}`;

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
  const fs = createMemfs();
  const ip = await resolveIp();
  const port = await resolvePort();
  const devServerHost = `http://${ip}:${port}`;
  const configure = await resolveConfigure(mode);
  const devServerPublicPath = devServerHost + publicPath;
  const entry = await resolveEntry(configure.entry, { host: `${ip}:${port}` });

  configure.entry = entry;
  configure.output.publicPath = devServerPublicPath;
  configure.devtool = 'eval-cheap-module-source-map';
  configure.cache.name = `${configure.name}-${configure.mode}-server`;

  configure.plugins.push(new webpack.SourceMapDevToolPlugin());

  const app = new Koa();
  const compiler = webpack(configure);
  const logger = compiler.getInfrastructureLogger('webpack-dev-middleware');

  app.use(koaCompress());

  const devServer = devMiddleware(compiler, {
    index: false,
    outputFileSystem: fs,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  });

  app.use(devServer);

  app.use(async ctx => {
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = fs.createReadStream(entryHTML);
  });

  app.on('error', error => {
    !httpError(error) && console.error(error);
  });

  app.listen(port, () => {
    devServer.waitUntilValid(() => {
      logger.info(`server run at: \u001B[36m${devServerHost}\u001B[0m`);
    });
  });
})();
