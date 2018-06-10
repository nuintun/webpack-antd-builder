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
const getChunksName = require('./chunks');
const notifier = require('node-notifier');
const happyPackLoaders = require('./happypack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin');
const WebpackGlobEntriesPlugin = require('webpack-glob-entries-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const polyfills = require.resolve('./polyfills');

const watcher = new WebpackGlobEntriesPlugin(configure.entry, {
  mapEntryName: file => {
    const extname = path.extname(file);
    const extnameLength = extname.length;

    let entryName = path.relative(configure.entryBasePath, file);

    if (extnameLength) {
      entryName = entryName.slice(0, -extnameLength);
    }

    return entryName;
  },
  mapEntry: file => {
    return [polyfills, file];
  }
});

module.exports = {
  entry: watcher.entries(),
  context: configure.context,
  output: {
    pathinfo: false,
    path: configure.outputPath,
    publicPath: configure.publicPath
  },
  resolve: {
    alias: configure.alias,
    modules: configure.modules,
    extensions: ['.js', '.jsx']
  },
  node: configure.node,
  stats: configure.stats,
  performance: configure.performance,
  optimization: {
    runtimeChunk: { name: 'runtime' },
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '&',
      cacheGroups: {
        default: {
          minSize: 30720,
          reuseExistingChunk: true,
          name: getChunksName('chunk'),
          test: module => {
            const test = /[\\/]node_modules[\\/]/i;

            if (module.nameForCondition && test.test(module.nameForCondition())) {
              return false;
            }

            for (const chunk of module.chunksIterable) {
              if (chunk.name && test.test(chunk.name)) return false;
            }

            return true;
          }
        },
        react: {
          name: 'react',
          enforce: true,
          test: /[\\/]node_modules[\\/]react(-dom)?[\\/]/i
        },
        antd: {
          name: 'antd',
          enforce: true,
          test: /[\\/]node_modules[\\/]antd[\\/]/i
        },
        vendors: {
          enforce: true,
          reuseExistingChunk: true,
          name: getChunksName('vendor'),
          test: /[\\/]node_modules[\\/](?!(antd|react(-dom)?)[\\/])/i
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
    new CleanWebpackPlugin(configure.outputPath, {
      verbose: false,
      root: process.cwd()
    })
  ],
  module: {
    strictExportPresence: true,
    noParse: configure.noParse,
    rules: [
      // The loader for js
      {
        test: /\.(js|jsx)($|\?)/i,
        loader: 'happypack/loader?id=js',
        exclude: /[\\/]node_modules[\\/]/
      },
      // The loader for css
      {
        test: /(?!\.module)\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css']
      },
      // The loader for css module
      {
        test: /\.module\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css-module']
      },
      // The loader for less
      {
        test: /(?!\.module)\.less$/i,
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=less']
      },
      // The loader for less module
      {
        test: /\.module\.less$/i,
        use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=less-module']
      },
      // The loader for assets
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/i,
        use: [{ loader: 'url-loader', options: { limit: 8192, name: '[path][name]-[hash:8].[ext]' } }]
      }
    ]
  }
};
