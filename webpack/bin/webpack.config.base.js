/**
 * @module webpack.config.base
 * @listens MIT
 * @author nuintun
 * @description 基础 Webpack 配置
 */

import webpack from 'webpack';
import { resolve } from 'path';
import resolveRules from '../lib/rules.js';
import appConfig from '../../app.config.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

/**
 * @function resolveEnvironment
 * @param {object} env
 * @return {object}
 */
function resolveEnvironment(env) {
  const output = {};
  const entries = Object.entries(env);

  for (const [key, value] of entries) {
    output[key] = JSON.stringify(value);
  }

  return output;
}

/**
 * @function resolveConfigure
 * @param {string} mode
 * @return {Promise<object>}
 */
export default async mode => {
  const progress = {
    percentBy: 'entries'
  };

  const isDevelopment = mode !== 'production';

  const env = resolveEnvironment({
    __DEV__: isDevelopment,
    __APP_NAME__: appConfig.name
  });

  const clean = {
    cleanOnceBeforeBuildPatterns: ['**/*', appConfig.entryHTML]
  };

  const html = {
    xhtml: true,
    meta: appConfig.meta,
    title: appConfig.name,
    minify: !isDevelopment,
    favicon: appConfig.favicon,
    filename: appConfig.entryHTML,
    templateParameters: { lang: appConfig.lang },
    template: resolve('webpack/template/index.ejs')
  };

  const css = {
    ignoreOrder: true,
    filename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
    chunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`
  };

  return {
    mode,
    name: appConfig.name,
    entry: appConfig.entry,
    context: appConfig.context,
    output: {
      hashFunction: 'xxhash64',
      path: appConfig.outputPath,
      publicPath: appConfig.publicPath,
      filename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      chunkFilename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      assetModuleFilename: `[path][${isDevelopment ? 'name' : 'contenthash'}][ext]`
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [
          resolve('.swcrc.js'),
          resolve('package.json'),
          resolve('.postcssrc.js'),
          resolve('app.config.js'),
          resolve('.browserslistrc')
        ]
      }
    },
    stats: {
      colors: true,
      chunks: false,
      children: false,
      entrypoints: false,
      runtimeModules: false,
      dependentModules: false
    },
    performance: {
      hints: false
    },
    resolve: {
      alias: appConfig.alias,
      fallback: { url: false },
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
      strictExportPresence: true,
      rules: await resolveRules(mode)
    },
    plugins: [
      new webpack.ProgressPlugin(progress),
      new CaseSensitivePathsPlugin(),
      new CleanWebpackPlugin(clean),
      new webpack.DefinePlugin(env),
      new MiniCssExtractPlugin(css),
      new HtmlWebpackPlugin(html)
    ],
    optimization: {
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      removeAvailableModules: true,
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`
      },
      splitChunks: {
        chunks: 'all'
      }
    }
  };
};
