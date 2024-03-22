/**
 * @module webpack.config.dev
 * @description 开发环境 Webpack 配置
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
import compress from 'koa-compress';
import resolveIp from '../lib/ip.js';
import dev from 'webpack-dev-service';
import { URL, URLSearchParams } from 'url';
import appConfig from '../../app.config.js';
import { findFreePorts } from 'find-free-ports';
import resolveConfigure from './webpack.config.base.js';

const { toString } = Object.prototype;
const { ports, publicPath } = appConfig;

/**
 * @function createMemfs
 * @return {import('../interface').OutputFileSystem}
 */
function createMemfs() {
  const volume = new memfs.Volume();
  const fs = memfs.createFsFromVolume(volume);

  return fs;
}

/**
 * @function resolvePort
 * @param {import('../interface').AppConfig['ports']} ports
 * @returns {number}
 */
async function resolvePort(ports = [8000]) {
  const [startPort, endPort = startPort + 1] = ports;
  const [port] = await findFreePorts(1, { startPort, endPort });

  return port;
}

/**
 * @function httpError
 * @param {Error & { code: string }} error
 * @return {boolean}
 */
function httpError(error) {
  return /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i.test(error.code);
}

/**
 * @function isTypeof
 * @param {unknown} value
 * @param {string} type
 * @returns {boolean}
 */
function isTypeof(value, type) {
  return toString.call(value).toLowerCase() === `[object ${type.toLowerCase()}]`;
}

/**
 * @function injectHotEntry
 * @typedef {import('webpack').Configuration['entry']} Entry
 * @param {Entry} entry
 * @param {Record<string | number, unknown>} options
 * @return {Entry}
 */
function injectHotEntry(entry, options) {
  const params = new URLSearchParams(options);
  const hotEntry = `webpack-dev-service/client?${params}`;

  if (Array.isArray(entry)) {
    return [...entry, hotEntry];
  }

  if (isTypeof(entry, 'string')) {
    return [entry, hotEntry];
  }

  return entry;
}

/**
 * @function resolveEntry
 * @typedef {import('webpack').Configuration['entry']} Entry
 * @param {Entry} entry
 * @param {Record<string | number, unknown>} options
 * @return {Entry}
 */
async function resolveEntry(entry, options) {
  if (typeof entry === 'function') {
    entry = entry();
  }

  if (typeof entry === 'function') {
    entry = await entry();
  }

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
  const port = await resolvePort(ports);
  const devServerHost = `http://${ip}:${port}`;
  const configure = await resolveConfigure(mode);
  const devServerPublicPath = new URL(publicPath, devServerHost).toString();
  const entry = await resolveEntry(configure.entry, { host: `${ip}:${port}` });

  configure.entry = entry;
  configure.cache.name = 'dev';
  configure.output.publicPath = devServerPublicPath;
  configure.devtool = 'eval-cheap-module-source-map';
  configure.watchOptions = { aggregateTimeout: 256 };

  const app = new Koa();
  const compiler = webpack(configure);

  const devService = dev(compiler, {
    outputFileSystem: fs,
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Credentials': 'true'
    }
  });

  app.use(compress({ br: false }));

  app.use(devService);

  app.use(async ctx => {
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = fs.createReadStream(appConfig.entryHTML);
  });

  app.on('error', error => {
    !httpError(error) && console.error(error);
  });

  app.listen(port, () => {
    devService.ready(() => {
      devService.logger.info(`server run at: \u001B[36m${devServerHost}\u001B[0m`);
    });
  });
})();
