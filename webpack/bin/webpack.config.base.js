/**
 * @module webpack.config.base
 * @listens MIT
 * @author nuintun
 * @description Webpack base configure
 */

'use strict';

const webpack = require('webpack');
const pkg = require('../../package.json');
const configure = require('../configure');
const resolveRules = require('../lib/rules');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

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

/**
 * @function resolveConfigure
 * @param {string} mode
 * @returns {Promise<object>}
 */
module.exports = async mode => {
  const progress = {
    percentBy: 'entries'
  };

  const isDevelopment = mode !== 'production';

  const env = resolveEnvironment({
    __DEV__: isDevelopment,
    __APP_TITLE__: configure.title
  });

  const clean = {
    cleanOnceBeforeBuildPatterns: ['**/*', configure.entryHTML]
  };

  const html = {
    xhtml: true,
    meta: configure.meta,
    title: configure.title,
    minify: !isDevelopment,
    favicon: configure.favicon,
    filename: configure.entryHTML,
    templateParameters: { lang: configure.lang },
    template: require.resolve('../template/index.ejs')
  };

  const css = {
    ignoreOrder: true,
    filename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
    chunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`
  };

  return {
    mode,
    name: pkg.name,
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
    watchOptions: {
      aggregateTimeout: 256
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
