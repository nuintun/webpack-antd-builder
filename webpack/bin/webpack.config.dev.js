/**
 * @module webpack.config.dev
 * @listens MIT
 * @author nuintun
 * @description Webpack development configure
 * @see https://github.com/facebook/create-react-app
 */

'use strict';

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

const webpack = require('webpack');
const { watchOptions } = require('../configure');
const resolveConfigure = require('./webpack.config.base');

(async () => {
  const configure = await resolveConfigure(mode);

  configure.watchOptions = watchOptions;
  configure.devtool = 'eval-cheap-module-source-map';

  configure.plugins.push(new webpack.SourceMapDevToolPlugin());

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
