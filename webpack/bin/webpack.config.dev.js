/**
 * @module webpack.config.dev
 * @listens MIT
 * @author nuintun
 * @description 开发模式 Webpack 配置
 * @see https://github.com/facebook/create-react-app
 */

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import webpack from 'webpack';
import resolveConfigure from './webpack.config.base.js';

(async () => {
  const configure = await resolveConfigure(mode);

  configure.cache.name = 'dev';
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
