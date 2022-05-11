/**
 * @module rules
 * @listens MIT
 * @author nuintun
 * @description Get webpack rules
 */

import fs from 'fs';
import less2js from './less2js.js';
import configure from '../configure.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/**
 * @function parseTheme
 * @description 解析主题文件
 * @param {string} path
 * @returns {Promise<object>}
 */
function parseTheme(path) {
  return new Promise(resolve => {
    fs.readFile(path, { encoding: 'utf-8' }, (error, code) => {
      resolve(error ? {} : less2js(code));
    });
  });
}

/**
 * @function resolveRules
 * @param {string} mode
 * @returns {object}
 */
export default async mode => {
  const { theme } = configure;
  const themeVars = await parseTheme(theme);
  const isDevelopment = mode !== 'production';
  const cssIdentName = isDevelopment ? '[local]-[hash:8]' : '[hash:8]';
  const cssModulesOptions = { auto: true, localIdentName: cssIdentName, exportLocalsConvention: 'camelCaseOnly' };

  return [
    {
      oneOf: [
        // The loader for js
        {
          test: /\.[jt]sx?$/,
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
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
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
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
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
          type: 'asset/resource',
          test: /\.(mp3|ogg|wav|mp4|flv|webm)$/
        },
        {
          test: /\.svg$/,
          oneOf: [
            {
              issuer: /\.[jt]sx?$/,
              type: 'asset/resource',
              resourceQuery: /^\?url$/
            },
            {
              issuer: /\.[jt]sx?$/,
              use: [
                {
                  loader: '@svgr/webpack',
                  options: { memo: true }
                }
              ]
            },
            {
              type: 'asset/resource'
            }
          ]
        },
        {
          type: 'asset/resource',
          test: /\.(png|gif|bmp|ico|jpe?g|woff2?|ttf|eot)$/
        }
      ]
    }
  ];
};
