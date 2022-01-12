/**
 * @module configure
 * @listens MIT
 * @author nuintun
 * @description Webpack project configure
 */

'use strict';

const path = require('path');

const js = path.resolve('Assets/js');
const css = path.resolve('Assets/css');
const images = path.resolve('Assets/images');
const modules = path.resolve('node_modules');

module.exports = {
  title: 'Antd',
  publicPath: '/public/',
  context: path.resolve('Assets'),
  outputPath: path.resolve('wwwroot/public'),
  entryHTML: path.resolve('wwwroot/app.html'),
  theme: path.resolve('Assets/css/theme.less'),
  favicon: path.resolve('wwwroot/favicon.ico'),
  entry: [path.resolve('Assets/js/pages/App.tsx')],
  alias: { '/js': js, '/css': css, '/images': images, '/modules': modules }
};
