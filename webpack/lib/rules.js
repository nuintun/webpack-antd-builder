/**
 * @module rules
 * @listens MIT
 * @author nuintun
 * @description Get webpack rules.
 */

'use strict';

const fs = require('fs');
const less2js = require('./less2js');
const { theme } = require('../configure');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * @function parseTheme
 * @description 解析主题文件
 * @param {string} path
 * @returns {object}
 */
function parseTheme(path) {
  try {
    return less2js(fs.readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * @function resolveRules
 * @param {string} mode
 * @returns {object}
 */
module.exports = async mode => {
  const themeVars = await parseTheme(theme);
  const isDevelopment = mode !== 'production';
  const cssIdentName = isDevelopment ? '[local]-[hash:8]' : '[hash:8]';
  const assetModuleFilename = `[path]${isDevelopment ? '[name].[ext]' : '[hash].[ext]'}`;
  const cssModulesOptions = { auto: true, localIdentName: cssIdentName, exportLocalsConvention: 'camelCaseOnly' };

  return [
    {
      oneOf: [
        // The loader for js
        {
          test: /\.[jt]sx?$/i,
          exclude: /[\\/]node_modules[\\/]/,
          use: [
            {
              loader: 'babel-loader',
              options: { highlightCode: true, cacheDirectory: true }
            }
          ]
        },
        // The loader for css
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: '@teamsupercell/typings-for-css-modules-loader'
            },
            {
              loader: 'css-loader',
              options: {
                esModule: true,
                importLoaders: 1,
                modules: cssModulesOptions
              }
            },
            {
              loader: 'postcss-loader'
            }
          ]
        },
        // The loader for less
        {
          test: /\.less$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: '@teamsupercell/typings-for-css-modules-loader'
            },
            {
              loader: 'css-loader',
              options: {
                esModule: true,
                importLoaders: 2,
                modules: cssModulesOptions
              }
            },
            {
              loader: 'postcss-loader'
            },
            {
              loader: 'less-loader',
              options: { lessOptions: { modifyVars: themeVars, javascriptEnabled: true } }
            }
          ]
        },
        // The loader for assets
        {
          test: /\.(mp3|ogg|wav|mp4|flv|webm)$/i,
          use: [
            {
              loader: 'file-loader',
              options: { esModule: true, name: assetModuleFilename }
            }
          ]
        },
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'babel-loader',
              options: { highlightCode: true, cacheDirectory: true }
            },
            {
              loader: '@svgr/webpack',
              options: { babel: false, memo: true, namedExport: 'Component' }
            },
            {
              loader: 'url-loader',
              options: { limit: 8192, esModule: true, name: assetModuleFilename }
            }
          ]
        },
        {
          test: /\.(png|gif|bmp|ico|jpe?g|woff2?|ttf|eot)$/i,
          use: [
            {
              loader: 'url-loader',
              options: { limit: 8192, esModule: true, name: assetModuleFilename }
            }
          ]
        }
      ]
    }
  ];
};
