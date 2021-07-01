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
process.env.BABEL_ENV = mode;

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const resolveConfigure = require('./webpack.config.base');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

(async () => {
  const configure = await resolveConfigure(mode);

  const analyzer = {
    logLevel: 'warn',
    generateStatsFile: true,
    analyzerMode: 'disabled',
    statsOptions: { source: false },
    statsFilename: path.resolve('node_modules/.cache/webpack-analyzer/report.json')
  };

  configure.devtool = false;
  configure.optimization.minimizer = [new CssMinimizerPlugin(), new TerserPlugin()];

  configure.plugins.push(new webpack.optimize.AggressiveMergingPlugin(), new BundleAnalyzerPlugin(analyzer));

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
