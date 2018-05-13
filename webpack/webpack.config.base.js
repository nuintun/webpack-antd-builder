/**
 * @module webpack.config.base
 * @author nuintun
 */

'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const theme = require('../theme');
const webpack = require('webpack');
const pkg = require('../package.json');
const notifier = require('node-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackGlobEntriesPlugin = require('webpack-glob-entries-plugin');
const WebpackManifestPlugin = require('@nuintun/webpack-manifest-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const watcher = new WebpackGlobEntriesPlugin('Assets/src/js/pages/**/*.jsx', {
  resolveEntryName: (base, file) => {
    const extname = path.extname(file);
    const extnameLength = extname.length;

    let entryName = path.relative('Assets/src/js', file);

    if (extnameLength) {
      entryName = entryName.slice(0, -extnameLength);
    }

    return entryName;
  }
});
const node = ['child_process', 'cluster', 'dgram', 'dns', 'fs', 'module', 'net', 'readline', 'repl', 'tls'].reduce(
  (acc, name) => Object.assign({}, acc, { [name]: 'empty' }),
  {}
);

module.exports = {
  entry: watcher.entries(),
  stats: {
    cached: false,
    cachedAssets: false,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    entrypoints: false,
    modules: false,
    moduleTrace: false,
    publicPath: false,
    reasons: false,
    source: false,
    timings: false
  },
  performance: {
    hints: false
  },
  optimization: {
    occurrenceOrder: true,
    runtimeChunk: { name: 'runtime' },
    splitChunks: {
      cacheGroups: {
        react: {
          test: module => {
            const name = module.nameForCondition();

            return /[\\/]node_modules[\\/]react(?:-dom)?[\\/]/i.test(name);
          },
          name: 'react',
          chunks: 'all',
          minSize: 102400,
          minChunks: 1
        },
        antd: {
          test: module => {
            const name = module.nameForCondition();

            return /[\\/]node_modules[\\/]antd[\\/]/i.test(name);
          },
          name: 'antd',
          chunks: 'all',
          minSize: 102400,
          minChunks: 1
        },
        vendors: {
          test: module => {
            const name = module.nameForCondition();

            return /[\\/]node_modules[\\/](?!(?:antd|react(?:-dom)?)[\\/])/i.test(name);
          },
          name: 'vendors',
          chunks: 'all',
          minSize: 102400,
          minChunks: 1
        }
      }
    }
  },
  plugins: [
    watcher,
    new CaseSensitivePathsPlugin(),
    new FriendlyErrorsWebpackPlugin({
      onErrors: (severity, errors) => {
        if (severity === 'error') {
          const error = errors[0];

          notifier.notify({
            sound: 'Glass',
            title: pkg.name,
            message: error.name,
            subtitle: error.file || '',
            icon: path.resolve('webpack/icons/fail.png'),
            contentImage: path.resolve('webpack/icons/fail.png')
          });
        }
      }
    }),
    new CleanWebpackPlugin('Assets/dist', {
      verbose: false,
      root: process.cwd()
    }),
    new WebpackManifestPlugin({
      publicPath: '/Assets/dist/',
      filter: module => !module.isAsset
    }),
    new CopyWebpackPlugin([
      { from: 'Assets/src/fonts/', to: 'fonts/', toType: 'dir' },
      { from: 'Assets/src/images/', to: 'images/', toType: 'dir' }
    ])
  ],
  node,
  resolve: {
    alias: {
      '~': path.resolve('Assets/src')
    },
    extensions: ['.js', '.jsx']
  },
  module: {
    noParse: [/[\\/]node_modules[\\/](?:moment)[\\/]/i],
    rules: [
      {
        test: /\.(js|jsx)($|\?)/i,
        exclude: /[\\/]node_modules[\\/]/,
        loader: 'babel-loader'
      },
      {
        test: /\.(woff2?|ttf|eot)($|\?)/i,
        loader: 'url-loader',
        options: {
          limit: 8192,
          emitFile: false,
          context: path.resolve('Assets/src'),
          name: '[path][name].[ext]?[hash]'
        }
      },
      {
        test: /\.svg($|\?)/i,
        loader: 'url-loader',
        options: {
          limit: 8192,
          emitFile: false,
          context: path.resolve('Assets/src'),
          name: '[path][name].[ext]?[hash]'
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif)($|\?)/i,
        loader: 'url-loader',
        options: {
          limit: 8192,
          emitFile: false,
          context: path.resolve('Assets/src'),
          name: '[path][name].[ext]?[hash]'
        }
      },
      {
        test(filePath) {
          return /\.css$/i.test(filePath) && !/\.module\.css$/i.test(filePath);
        },
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.module\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          'postcss-loader'
        ]
      },
      {
        test(filePath) {
          return /\.less$/i.test(filePath) && !/\.module\.less$/i.test(filePath);
        },
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              modifyVars: theme,
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.module\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              modifyVars: theme,
              javascriptEnabled: true
            }
          }
        ]
      }
    ]
  }
};
