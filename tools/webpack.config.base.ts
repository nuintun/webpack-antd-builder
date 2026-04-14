/**
 * @module webpack.config.base
 * @description 基础 Webpack 配置
 */

import webpack from 'webpack';
import { resolve } from 'node:path';
import { scanFiles } from './utils/fs.ts';
import resolveRules from './utils/rules.ts';
import type { Configuration } from 'webpack';
import resolveConfig from './../app.config.ts';
import resolveHtmlPlugins from './utils/pages.ts';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolveEnvironment } from './utils/env.ts';
import type { AppConfig, Mode } from './utils/types.ts';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/**
 * @function webpackrc
 * @description 生成 Webpack 配置
 * @param mode 打包模式
 */
export default async function (mode: Mode): Promise<[AppConfig, Configuration]> {
  const isDevelopment = mode !== 'production';

  const appConfig = await resolveConfig(mode);
  const env = await resolveEnvironment(mode, appConfig);

  const progress = {
    percentBy: 'entries'
  } as const;

  const css = {
    ignoreOrder: true,
    filename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
    chunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`
  };

  return [
    appConfig,
    {
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
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      },
      plugins: [
        new webpack.ProgressPlugin(progress),
        new webpack.DefinePlugin(env),
        new MiniCssExtractPlugin(css),
        ...resolveHtmlPlugins(mode, appConfig),
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
    }
  ];
}
