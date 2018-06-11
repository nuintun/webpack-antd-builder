/**
 * @module loaders
 * @listens MIT
 * @author nuintun
 * @description Get webpack loaders.
 */

'use strict';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = hot => {
  const cssHotLoaders = hot ? ['css-hot-loader'] : [];

  return [
    // The loader for js
    {
      test: /\.(js|jsx)($|\?)/i,
      loader: 'happypack/loader?id=js',
      exclude: /[\\/]node_modules[\\/]/
    },
    // The loader for css
    {
      test: file => /\.css$/i.test(file) && !/\.module\.css$/i.test(file),
      use: [...cssHotLoaders, MiniCssExtractPlugin.loader, 'happypack/loader?id=css']
    },
    // The loader for css module
    {
      test: /\.module\.css$/i,
      use: [...cssHotLoaders, MiniCssExtractPlugin.loader, 'happypack/loader?id=css-module']
    },
    // The loader for less
    {
      test: file => /\.less$/i.test(file) && !/\.module\.less$/i.test(file),
      use: [...cssHotLoaders, MiniCssExtractPlugin.loader, 'happypack/loader?id=less']
    },
    // The loader for less module
    {
      test: /\.module\.less$/i,
      use: [...cssHotLoaders, MiniCssExtractPlugin.loader, 'happypack/loader?id=less-module']
    },
    // The loader for assets
    {
      test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/i,
      use: [{ loader: 'url-loader', options: { limit: 8192, name: '[path][name]-[hash:8].[ext]' } }]
    }
  ];
};
