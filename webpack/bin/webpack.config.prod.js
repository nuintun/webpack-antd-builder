/**
 * @module webpack.config.prod
 * @listens MIT
 * @author nuintun
 * @description Webpack production configure
 * @see https://github.com/facebook/create-react-app
 */

'use strict';

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const resolveConfigure = require('./webpack.config.base');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

(async () => {
  const configure = await resolveConfigure(mode);

  configure.devtool = false;

  configure.plugins.push(new webpack.optimize.AggressiveMergingPlugin());

  configure.optimization.minimizer = [new CssMinimizerPlugin(), new TerserPlugin()];

  // 开启 webpack-bundle-analyzer 分析工具
  if (process.argv[2] === '--report') {
    configure.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', analyzerPort: 'auto' }));
  }

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
