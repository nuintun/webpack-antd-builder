/**
 * @module dev
 * @license MIT
 * @author nuintun
 * @author yiminghe
 * @description Webpack dev middleware for koa2
 * @see https://github.com/yiminghe/koa-webpack-dev-middleware/blob/2.x/src/index.js
 */

'use strict';

const expressMiddleware = require('webpack-dev-middleware');

module.exports = (compiler, options) => {
  const middleware = expressMiddleware(compiler, options);

  const devMiddleware = async (ctx, next) => {
    ctx.remove('Content-Type');

    await middleware(
      ctx.req,
      {
        locals: ctx.state,
        status(statusCode) {
          ctx.status = statusCode;
        },
        set(field, value) {
          ctx.response.set(field, value);
        },
        get(field) {
          return ctx.response.get(field);
        },
        send(content) {
          ctx.body = content;
        }
      },
      next
    );
  };

  for (const [prop, value] of Object.entries(middleware)) {
    devMiddleware[prop] = value;
  }

  return devMiddleware;
};
