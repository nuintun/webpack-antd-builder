/**
 * @module webpack.config.base
 * @description 基础 Webpack 配置
 */

import webpack from 'webpack';
import { join, resolve } from 'node:path';
import resolveRules from '../lib/rules.js';
import { readdir } from 'node:fs/promises';
import appConfig from '../../app.config.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

/**
 * @function read
 * @param {string} path
 * @return {Promise<import('fs').Dirent[]>}
 */
async function read(path) {
  const entries = await readdir(path, {
    withFileTypes: true
  });

  return entries.values();
}

/**
 * @function getFiles
 * @param {string} root
 * @return {Promise<string[]>}
 */
export async function getFilesInDirectory(root) {
  const files = [];
  const waiting = [];

  root = resolve(root);

  let current = [root, await read(root)];

  while (current) {
    const [, iterator] = current;
    const item = iterator.next();

    if (item.done) {
      current = waiting.pop();
    } else {
      const [dirname] = current;
      const { value: stat } = item;
      const path = join(dirname, stat.name);

      if (stat.isFile()) {
        files.push(path);
      } else if (stat.isDirectory()) {
        waiting.push([path, await read(path)]);
      }
    }
  }

  return files;
}

/**
 * @function resolveEnvironment
 * @param {string} mode
 * @param {object} env
 * @return {Promise<Record<string, string>>}
 */
async function resolveEnvironment(mode, env) {
  if (typeof env === 'function') {
    env = await env(mode, process.env);
  }

  env = {
    ...env,
    __APP_NAME__: appConfig.name,
    __DEV__: mode !== 'production'
  };

  const output = {};
  const entries = Object.entries(env);

  for (const [key, value] of entries) {
    output[key] = JSON.stringify(value);
  }

  return output;
}

/**
 * @function webpackrc
 * @param {string} mode
 * @return {Promise<import('webpack').Configuration>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';

  const progress = {
    percentBy: 'entries'
  };

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
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    plugins: [
      new webpack.ProgressPlugin(progress),
      new CaseSensitivePathsPlugin(),
      new webpack.DefinePlugin(env),
      new MiniCssExtractPlugin(css),
      new HtmlWebpackPlugin(html),
      ...(appConfig.plugins || [])
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
          resolve('.swcrc.js'),
          resolve('.svgorc.js'),
          resolve('package.json'),
          resolve('.postcssrc.js'),
          resolve('app.config.js'),
          resolve('.browserslistrc')
        ],
        tools: await getFilesInDirectory('tools')
      }
    }
  };
};
