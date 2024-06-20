/**
 * @module server
 */

import fs from 'fs';
import Koa from 'koa';
import dayjs from 'dayjs';
import files from 'koa-files';
import compress from 'koa-compress';

const app = new Koa();
const port = parseInt(process.env.PORT) || 8080;

app.proxy = true;

app.use(compress());

app.use(files('wwwroot'));

app.use(async context => {
  context.type = 'text/html; charset=utf-8';
  context.body = fs.createReadStream('wwwroot/app.html');
});

app.listen(port, () => {
  const host = `http://127.0.0.1:${port}`;
  const now = dayjs().format('YYYY-MM-DD hh:mm:ss');

  console.log(`[${now}] server run at: \u001B[36m${host}\u001B[0m`);
});
