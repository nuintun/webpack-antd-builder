/**
 * @module webpack.config.base
 * @listens MIT
 * @author nuintun
 * @description Webpack base configure
 */

import webpack from 'webpack';
import { createRequire } from 'module';
import configure from '../configure.js';
import resolveRules from '../lib/rules.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

/**
 * @function resolveEnvironment
 * @param {object} env
 * @returns {object}
 */
function resolveEnvironment(env) {
  const output = {};
  const entries = Object.entries(env);

  for (const [key, value] of entries) {
    output[key] = JSON.stringify(value);
  }

  return output;
}

const { resolve } = createRequire(import.meta.url);

/**
 * @function resolveConfigure
 * @param {string} mode
 * @returns {Promise<object>}
 */
export default async mode => {
  const progress = {
    percentBy: 'entries'
  };

  const isDevelopment = mode !== 'production';

  const env = resolveEnvironment({
    __DEV__: isDevelopment,
    __APP_NAME__: configure.name
  });

  const clean = {
    cleanOnceBeforeBuildPatterns: ['**/*', configure.entryHTML]
  };

  const html = {
    xhtml: true,
    meta: configure.meta,
    title: configure.name,
    minify: !isDevelopment,
    favicon: configure.favicon,
    filename: configure.entryHTML,
    template: resolve('../template/index.ejs'),
    templateParameters: { lang: configure.lang }
  };

  const css = {
    ignoreOrder: true,
    filename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
    chunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`
  };

  return {
    mode,
    name: configure.name,
    entry: configure.entry,
    context: configure.context,
    output: {
      hashFunction: 'xxhash64',
      path: configure.outputPath,
      publicPath: configure.publicPath,
      filename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      chunkFilename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      assetModuleFilename: `[path][${isDevelopment ? 'name' : 'contenthash'}][ext]`
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        theme: [configure.theme]
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
      alias: configure.alias,
      fallback: { url: false },
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
      noParse: configure.noParse,
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
