/**
 * @module webpack.config.base
 * @description 基础 Webpack 配置
 */

import webpack from 'webpack';
import { resolve } from 'node:path';
import type { Mode } from '../index.ts';
import { scanFiles } from '../lib/fs.ts';
import resolveRules from '../lib/rules.ts';
import appConfig from '../../app.config.ts';
import type { Configuration } from 'webpack';
import { resolveEnvironment } from '../lib/env.ts';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/**
 * @function webpackrc
 * @description 生成 Rspack 配置
 * @param mode 打包模式
 */
export default async function (mode: Mode): Promise<Configuration> {
  const isDevelopment = mode !== 'production';

  const progress = {
    percentBy: 'entries'
  } as const;

  const html = {
    xhtml: true,
    meta: appConfig.meta,
    title: appConfig.name,
    minify: !isDevelopment,
    favicon: appConfig.favicon,
    filename: appConfig.entryHTML,
    template: resolve('tools/lib/template.ejs'),
    templateParameters: { lang: appConfig.lang }
  };

  const env = await resolveEnvironment(mode, appConfig.env);

  const css = {
    ignoreOrder: true,
    filename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
    chunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`
  };

  return {
    mode,
    performance: false,
    name: appConfig.name,
    entry: appConfig.entry,
    context: appConfig.context,
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      cssFilename: css.filename,
      path: appConfig.outputPath,
      publicPath: appConfig.publicPath,
      cssChunkFilename: css.chunkFilename,
      filename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      chunkFilename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      assetModuleFilename: `[path][${isDevelopment ? 'name' : 'contenthash'}][ext]`
    },
    module: {
      rules: await resolveRules(mode)
    },
    resolve: {
      alias: appConfig.alias,
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs']
    },
    plugins: [
      new webpack.ProgressPlugin(progress),
      new webpack.DefinePlugin(env),
      new MiniCssExtractPlugin(css),
      new HtmlWebpackPlugin(html),
      ...(appConfig.plugins ?? [])
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxSize: 512 * 1024
      },
      runtimeChunk: 'single',
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      removeAvailableModules: true
    },
    stats: {
      all: false,
      assets: true,
      colors: true,
      errors: true,
      timings: true,
      version: true,
      warnings: true,
      errorsCount: true,
      warningsCount: true,
      groupAssetsByPath: true
    },
    externals: appConfig.externals,
    externalsType: appConfig.externalsType,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [
          resolve('.swcrc.ts'),
          resolve('.svgorc.ts'),
          resolve('package.json'),
          resolve('.postcssrc.ts'),
          resolve('app.config.ts'),
          resolve('.browserslistrc')
        ],
        tools: await scanFiles('tools')
      }
    }
  };
}
