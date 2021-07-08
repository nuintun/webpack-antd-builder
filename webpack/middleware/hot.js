/**
 * @module hot
 * @license MIT
 * @author nuintun
 * @author kimjuny
 * @description Webpack hot middleware for koa2
 * @see https://github.com/kimjuny/koa-webpack-server/blob/master/src/hot.js
 */

'use strict';

const { PassThrough } = require('stream');
const expressMiddleware = require('webpack-hot-middleware');

module.exports = (compiler, options) => {
  const middleware = expressMiddleware(compiler, options);

  const hotMiddleware = async (ctx, next) => {
    const stream = new PassThrough();

    ctx.body = stream;

    const locals = ctx.state;
    const end = stream.end.bind(stream);
    const write = stream.write.bind(stream);
    const writeHead = (status, headers) => {
      ctx.status = status;

      ctx.set(headers);
    };

    await middleware(ctx.req, { locals, writeHead, write, end }, next);
  };

  for (const [prop, value] of Object.entries(middleware)) {
    hotMiddleware[prop] = value;
  }

  return hotMiddleware;
};
