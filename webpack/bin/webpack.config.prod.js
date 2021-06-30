/**
 * @module webpack.config.prod
 * @listens MIT
 * @author nuintun
 * @description Webpack production configure.
 * @see https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/config/webpack.config.prod.js
 */

'use strict';

const mode = 'production';

process.env.NODE_ENV = mode;

const path = require('path');
const webpack = require('webpack');
const resolveRules = require('../lib/rules');
const configure = require('./webpack.config.base');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

(async () => {
  const css = {
    ignoreOrder: true,
    filename: 'css/[chunkhash].css',
    chunkFilename: 'css/[chunkhash].css'
  };

  const analyzer = {
    generateStatsFile: true,
    analyzerMode: 'disabled',
    statsOptions: { source: false },
    statsFilename: path.resolve('node_modules/.cache/webpack-analyzer/report.json')
  };

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
    new BundleAnalyzerPlugin(analyzer),
    new MiniCssExtractPlugin(css)
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
