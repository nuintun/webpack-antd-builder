/**
 * @module webpack.config.dev
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.dev.js
 */

'use strict';

const webpack = require('webpack');
const resolveRules = require('../lib/rules');
const configure = require('./webpack.config.base');
const { entryHTML, watchOptions } = require('../configure');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

(async () => {
  configure.mode = mode;
  configure.devtool = 'eval-cheap-module-source-map';
  configure.output = {
    ...configure.output,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js'
  };
  configure.plugins = [
    ...configure.plugins,
    new webpack.SourceMapDevToolPlugin(),
    new webpack.DefinePlugin({ __DEV__: mode !== 'production' }),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['**/*', entryHTML] }),
    new MiniCssExtractPlugin({ filename: 'css/[name].css', chunkFilename: 'css/chunk-[id].css', ignoreOrder: true })
  ];
  configure.watchOptions = watchOptions;
  configure.module.rules = await resolveRules(mode);

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
