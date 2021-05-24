/**
 * @module configure
 * @listens MIT
 * @author nuintun
 * @description Paths configure.
 */

'use strict';

const path = require('path');

const js = path.resolve('Assets/js');
const css = path.resolve('Assets/css');
const images = path.resolve('Assets/images');

module.exports = {
  title: 'Antd',
  publicPath: '/public/',
  outputPath: path.resolve('wwwroot/public'),
  entryHTML: path.resolve('wwwroot/app.html'),
  theme: path.resolve('Assets/css/theme.less'),
  favicon: path.resolve('wwwroot/favicon.ico'),
  entry: [path.resolve('Assets/js/pages/App.tsx')],
  alias: { '~js': js, '~css': css, '~images': images }
};
