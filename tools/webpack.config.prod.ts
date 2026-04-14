/**
 * @module webpack.config.prod
 * @description 生产环境 Webpack 配置
 * @see https://github.com/facebook/create-react-app
 */

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import webpack from 'webpack';
import browserslist from 'browserslist';
import targets from './utils/targets.ts';
import TerserPlugin from 'terser-webpack-plugin';
import { browserslistToTargets } from 'lightningcss';
import resolveConfigs from './webpack.config.base.ts';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

const [, configure] = await resolveConfigs(mode);

configure.devtool = false;
// @ts-expect-error
configure.cache.name = 'prod';

// @ts-expect-error
// 使用自定义 minimizer 工具
configure.optimization.minimizer = [
  new TerserPlugin({
    terserOptions: {
      format: {
        comments: false
      }
    },
    minify: TerserPlugin.swcMinify
  }),
  new CssMinimizerPlugin({
    minify: CssMinimizerPlugin.lightningCssMinify,
    minimizerOptions: {
      targets: browserslistToTargets(browserslist(await targets()))
    }
  })
];

const compiler = webpack(configure);

compiler.run((error, stats) => {
  compiler.close(() => {
    if (error) {
      console.error(error);
    } else {
      console.log(stats?.toString(compiler.options.stats));
    }
  });
});
