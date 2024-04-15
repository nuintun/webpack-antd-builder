/**
 * @module app.config
 * @description 应用配置
 */

import path from 'path';

const js = path.resolve('app/js');
const css = path.resolve('app/css');
const images = path.resolve('app/images');

/**
 * @type {import('./tools/interface').AppConfig}
 */
export default {
  ports: 8000,
  name: 'Antd',
  lang: 'zh-CN',
  publicPath: '/public/',
  context: path.resolve('app'),
  outputPath: path.resolve('wwwroot/public'),
  entryHTML: path.resolve('wwwroot/app.html'),
  entry: path.resolve('app/js/pages/index.tsx'),
  favicon: path.resolve('app/images/favicon.ico'),
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
};
