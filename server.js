/**
 * @module server
 */

import fs from 'fs';
import Koa from 'koa';
import files from 'koa-files';
import compress from 'koa-compress';

const port = 8000;
const app = new Koa();
const publicPath = 'wwwroot';
const entryHTML = 'wwwroot/app.html';

app.use(compress());

app.use(files(publicPath));

app.use(async ctx => {
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = fs.createReadStream(entryHTML);
});

app.on('error', error => {
  !httpError(error) && console.error(error);
});

app.listen(port, () => {
  console.log(`server run at: \u001B[36mhttp://127.0.0.1:${port}\u001B[0m`);
});
