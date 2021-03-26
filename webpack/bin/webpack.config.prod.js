/**
 * @module webpack.config.prod
 * @listens MIT
 * @author nuintun
 * @description Webpack production configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.prod.js
 */

'use strict';

const webpack = require('webpack');
const resolveRules = require('../lib/rules');
const { entryHTML } = require('../configure');
const configure = require('./webpack.config.base');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

(async () => {
  configure.mode = mode;
  configure.devtool = false;
  configure.output = {
    ...configure.output,
    filename: 'js/[chunkhash].js',
    chunkFilename: 'js/[chunkhash].js'
  };
  configure.plugins = [
    ...configure.plugins,
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({ __DEV__: mode !== 'production' }),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['**/*', entryHTML] }),
    new MiniCssExtractPlugin({ filename: 'css/[chunkhash].css', chunkFilename: 'css/[chunkhash].css', ignoreOrder: true })
  ];
  configure.module.rules = await resolveRules(mode);
  configure.optimization.minimizer = [new CssMinimizerPlugin(), new TerserPlugin()];

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
