/**
 * @module webpack.config.base
 * @listens MIT
 * @author nuintun
 * @description Webpack base configure.
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const pkg = require('../package.json');
const configure = require('./configure');
const notifier = require('node-notifier');
const happyPackLoaders = require('./happypack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin');
const WebpackGlobEntriesPlugin = require('webpack-glob-entries-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const watcher = new WebpackGlobEntriesPlugin(configure.entry, {
  resolveEntryName: (base, file) => {
    const extname = path.extname(file);
    const extnameLength = extname.length;

    let entryName = path.relative(configure.entryBase, file);

    if (extnameLength) {
      entryName = entryName.slice(0, -extnameLength);
    }

    return entryName;
  }
});

module.exports = {
  entry: watcher.entries(),
  output: {
    path: configure.distPath,
    publicPath: configure.publicPath
  },
  resolve: {
    alias: configure.alias,
    modules: configure.modules,
    extensions: ['.js', '.jsx']
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
    repl: 'empty',
    dgram: 'empty',
    module: 'empty',
    cluster: 'empty',
    readline: 'empty',
    child_process: 'empty'
  },
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
    runtimeChunk: { name: 'runtime' },
    splitChunks: {
      automaticNameDelimiter: '-',
      cacheGroups: {
        default: {
          minSize: 0,
          chunks: 'initial',
          name: require('./chunks-name'),
          test: /[\\/]Assets[\\/]src[\\/]/i
        },
        react: {
          name: 'react',
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]react(?:-dom)?[\\/]/i
        },
        antd: {
          name: 'antd',
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]antd[\\/]/i
        },
        vendors: {
          name: 'vendors',
          chunks: 'initial',
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/](?!(?:antd|react(?:-dom)?)[\\/])/i
        }
      }
    }
  },
  plugins: [
    watcher,
    ...happyPackLoaders,
    new ProgressBarWebpackPlugin(),
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
    new CleanWebpackPlugin(configure.distPath, {
      verbose: false,
      root: process.cwd()
    }),
    new CopyWebpackPlugin(configure.copyConfigure)
  ],
  module: {
    strictExportPresence: true,
    noParse: [/[\\/]moment[\\/]moment\.js/i],
    rules: [
      {
        test: /\.(js|jsx)($|\?)/i,
        exclude: /[\\/]node_modules[\\/]/,
        loader: 'happypack/loader?id=js'
      },
      {
        test: /\.(woff2?|ttf|eot)($|\?)/i,
        loader: 'happypack/loader?id=font'
      },
      {
        test: /\.svg($|\?)/i,
        loader: 'happypack/loader?id=svg'
      },
      {
        test: /\.(png|jpg|jpeg|gif)($|\?)/i,
        loader: 'happypack/loader?id=image'
      },
      {
        test(filePath) {
          return /\.css$/i.test(filePath) && !/\.module\.css$/i.test(filePath);
        },
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css']
      },
      {
        test: /\.module\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css-module']
      },
      {
        test(filePath) {
          return /\.less$/i.test(filePath) && !/\.module\.less$/i.test(filePath);
        },
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=less']
      },
      {
        test: /\.module\.less$/i,
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=less-module']
      }
    ]
  }
};
