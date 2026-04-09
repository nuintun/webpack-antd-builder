/**
 * @module app.config
 * @description 应用构建配置文件，定义打包规则的项目级配置
 */

import { resolve } from 'node:path';
import { defineConfig } from './tools/index.ts';

const js = resolve('app/js');
const css = resolve('app/css');
const images = resolve('app/images');

// 生成配置文件
export default defineConfig({
  ports: 8000,
  lang: 'zh-CN',
  name: 'Ant Design',
  publicPath: '/public/',
  context: resolve('app'),
  outputPath: resolve('wwwroot/public'),
  entryHTML: resolve('wwwroot/app.html'),
  entry: resolve('app/js/pages/index.tsx'),
  favicon: resolve('app/images/favicon.ico'),
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
});
