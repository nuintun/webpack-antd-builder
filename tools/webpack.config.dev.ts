/**
 * @module webpack.config.dev
 * @description 开发环境 Webpack 配置
 * @see https://github.com/facebook/create-react-app
 */

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import Koa from 'koa';
import webpack from 'webpack';
import compress from 'koa-compress';
import resolveIp from './utils/ip.ts';
import { createMemfs } from './utils/fs.ts';
import { resolvePort } from './utils/port.ts';
import { isFunction } from './utils/typeof.ts';
import { server as dev } from 'webpack-dev-service';
import resolveConfigs from './webpack.config.base.ts';
import resolveConfigure from './webpack.config.base.ts';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';

// HTTP client error codes.
const HTTP_CLIENT_ERROR_CODES = new Set([
  'EOF', // End of file - client closed connection.
  'EPIPE', // Broken pipe - client disconnected.
  'ECANCELED', // Operation canceled.
  'ECONNRESET', // Connection reset by peer.
  'ECONNABORTED', // Connection aborted.
  'ERR_STREAM_PREMATURE_CLOSE' // Stream closed before finishing.
]);

const [{ ports, historyApiFallback }, configure] = await resolveConfigs(mode);

const ip = resolveIp();
const fs = createMemfs();
const port = await resolvePort(ports);
const devServerHost = `http://${ip}:${port}`;

// @ts-expect-error
configure.cache.name = 'dev';
configure.devtool = 'eval-cheap-module-source-map';
configure.watchOptions = { aggregateTimeout: 256 };

// @ts-expect-error
configure.plugins.push(new ReactRefreshPlugin({ overlay: false }));

const app = new Koa();
const compiler = webpack(configure);

const devService = await dev(compiler, {
  fs,
  headers: {
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  }
});

app.use(
  compress({
    br: false
  })
);

app.use(devService);

if (historyApiFallback != null) {
  app.use(async ctx => {
    ctx.type = 'text/html; charset=utf-8';

    if (isFunction(historyApiFallback)) {
      ctx.body = fs.createReadStream(historyApiFallback(ctx.path));
    } else {
      ctx.body = fs.createReadStream(historyApiFallback);
    }
  });
}

app.on('error', error => {
  if (!HTTP_CLIENT_ERROR_CODES.has(error.code)) {
    console.error(error);
  }
});

app.listen(port, () => {
  devService.logger.info(`server run at: \x1b[36m${devServerHost}\x1b[0m`);
});
