/**
 * @module loaders
 * @listens MIT
 * @author nuintun
 * @description Get webpack loaders.
 */

'use strict';

const theme = require('../../theme');
const { context } = require('../configure');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const localIdentName = '[local]-[hash:base64:6]';
const sourceMap = process.env.NODE_ENV !== 'production';

module.exports = hot => {
  const cssHotLoaders = hot ? ['css-hot-loader'] : [];

  return [
    // The loader for js
    {
      test: /\.(js|jsx)($|\?)/i,
      exclude: /[\\/]node_modules[\\/]/,
      use: [{ loader: 'babel-loader', options: { highlightCode: true, cacheDirectory: true } }]
    },
    // The loader for css
    {
      test: file => /\.css$/i.test(file) && !/\.module\.css$/i.test(file),
      use: [
        ...cssHotLoaders,
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader', options: { sourceMap, importLoaders: 1 } },
        { loader: 'postcss-loader', options: { sourceMap } }
      ]
    },
    // The loader for css module
    {
      test: /\.module\.css$/i,
      use: [
        ...cssHotLoaders,
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: { modules: true, camelCase: true, sourceMap, localIdentName, importLoaders: 1 }
        },
        { loader: 'postcss-loader', options: { sourceMap } }
      ]
    },
    // The loader for less
    {
      test: file => /\.less$/i.test(file) && !/\.module\.less$/i.test(file),
      use: [
        ...cssHotLoaders,
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader', options: { sourceMap, importLoaders: 2 } },
        { loader: 'postcss-loader', options: { sourceMap } },
        { loader: 'less-loader', options: { modifyVars: theme, sourceMap, javascriptEnabled: true } }
      ]
    },
    // The loader for less module
    {
      test: /\.module\.less$/i,
      use: [
        ...cssHotLoaders,
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: { modules: true, camelCase: true, sourceMap, localIdentName, importLoaders: 2 }
        },
        { loader: 'postcss-loader', options: { sourceMap } },
        { loader: 'less-loader', options: { modifyVars: theme, sourceMap, javascriptEnabled: true } }
      ]
    },
    // The loader for assets
    {
      test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot)$/i,
      use: [{ loader: 'url-loader', options: { limit: 8192, context, name: '[path][name]-[hash:8].[ext]' } }]
    }
  ];
};
