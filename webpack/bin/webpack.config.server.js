/**
 * @module webpack.config.server
 * @listens MIT
 * @author nuintun
 * @description 监听模式 Webpack 配置
 * @see https://github.com/facebook/create-react-app
 */

'use strict';

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import Koa from 'koa';
import path from 'path';
import memfs from 'memfs';
import webpack from 'webpack';
import resolveIp from '../lib/ip.js';
import { URLSearchParams } from 'url';
import koaCompress from 'koa-compress';
import configure from '../configure.js';
import { findFreePorts } from 'find-free-ports';
import devMiddleware from 'koa-webpack-dev-service';
import resolveConfigure from './webpack.config.base.js';

const { toString } = Object.prototype;
const { publicPath, entryHTML } = configure;

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
  const hotEntry = `koa-webpack-dev-service/client?${params}`;

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
  configure.cache.name = 'server';
  configure.output.publicPath = devServerPublicPath;
  configure.devtool = 'eval-cheap-module-source-map';
  configure.watchOptions = { aggregateTimeout: 256 };

  configure.plugins.push(new webpack.SourceMapDevToolPlugin());

  const app = new Koa();
  const compiler = webpack(configure);

  app.use(async (ctx, next) => {
    ctx.set({
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Credentials': 'true'
    });

    await next();
  });

  app.use(koaCompress({ br: false }));

  const devServer = devMiddleware(compiler, {
    index: false,
    outputFileSystem: fs
  });

  app.use(devServer);

  app.use(async ctx => {
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = fs.readFileSync(entryHTML);
  });

  app.on('error', error => {
    !httpError(error) && console.error(error);
  });

  app.listen(port, () => {
    devServer.waitUntilValid(() => {
      const { logger } = devServer.context;

      logger.info(`server run at: \u001B[36m${devServerHost}\u001B[0m`);
    });
  });
})();
