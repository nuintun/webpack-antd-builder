/**
 * @module webpack.config.dev
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.dev.js
 */

'use strict';

const mode = 'development';

process.env.NODE_ENV = mode;

const webpack = require('webpack');
const resolveRules = require('../lib/rules');
const { watchOptions } = require('../configure');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

(async () => {
  const css = {
    ignoreOrder: true,
    filename: 'css/[name].css',
    chunkFilename: 'css/chunk-[id].css'
  };

  configure.mode = mode;
  configure.watchOptions = watchOptions;
  configure.module.rules = await resolveRules(mode);
  configure.devtool = 'eval-cheap-module-source-map';
  configure.output = { ...configure.output, filename: 'js/[name].js', chunkFilename: 'js/[name].js' };
  configure.plugins = [...configure.plugins, new webpack.SourceMapDevToolPlugin(), new MiniCssExtractPlugin(css)];

  const compiler = webpack(configure);

  compiler.run((error, stats) => {
    compiler.close(() => {
      if (error) {
        console.error(error);
      } else {
        console.log(stats.toString(compiler.options.stats));
      }
    });
  });
})();
