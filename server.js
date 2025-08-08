/**
 * @module server
 */

import Koa from 'koa';
import fs from 'node:fs';
import os from 'node:os';
import dayjs from 'dayjs';
import cluster from 'node:cluster';
import { server } from 'koa-files';
import compress from 'koa-compress';

function cyan(text) {
  if (text == null) {
    return '';
  }

  return `\x1b[36m${text}\x1b[0m`;
}

function green(text) {
  if (text == null) {
    return '';
  }

  return `\x1b[32m${text}\x1b[0m`;
}

function yellow(text) {
  if (text == null) {
    return '';
  }

  return `\x1b[33m${text}\x1b[0m`;
}

function now(template) {
  return dayjs().format(template);
}

if (cluster.isPrimary) {
  const cpus = os.cpus().length;

  console.log(`${green(`[${now()}]`)} 主进程 ${yellow(process.pid)} 开始运行...`);

  // 根据 CPU 核心数创建工作进程
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', worker => {
    // 当一个工作进程退出时，自动创建一个新的工作进程
    cluster.fork();

    console.log(`${green(`[${now()}]`)} 工作进程 ${yellow(worker.process.pid)} 已退出，正在重新启动...`);
  });
} else {
  const app = new Koa();
  const port = parseInt(process.env.PORT) || 8080;
  const HTTP_ERROR_RE = /^(EOF|EPIPE|ECANCELED|ECONNRESET|ECONNABORTED)$/i;

  app.proxy = true;

  app.use(compress());

  app.use(
    server('wwwroot', {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  );

  app.use(async context => {
    context.type = 'text/html; charset=utf-8';
    context.body = fs.createReadStream('wwwroot/app.html');
  });

  app.on('error', error => {
    const { code } = error;

    if (code == null || !HTTP_ERROR_RE.test(code)) {
      console.error(error);
    }
  });

  app.listen(port, () => {
    const host = `http://127.0.0.1:${port}`;

    console.log(`${green(`[${now()}]`)} 工作进程 ${yellow(process.pid)} 监听中：${cyan(host)}`);
  });
}
