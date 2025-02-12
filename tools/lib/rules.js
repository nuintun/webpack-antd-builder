/**
 * @module rules
 * @description 配置 Webpack 规则
 */

import swcrc from '../../.swcrc.js';
import svgorc from '../../.svgorc.js';
import postcssrc from '../../.postcssrc.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/**
 * @function resolveRules
 * @param {string} mode
 * @return {Promise<NonNullable<import('webpack').Configuration['module']>['rules']>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';
  const swcOptions = { ...(await swcrc(mode)), swcrc: false };
  const svgoOptions = { ...(await svgorc(mode)), configFile: false };
  const postcssOptions = { postcssOptions: { ...(await postcssrc(mode)), config: false } };

  /**
   * @function getCssLoaderOptions
   * @param {number} importLoaders
   * @return {object}
   */
  const getCssLoaderOptions = importLoaders => {
    return {
      importLoaders,
      esModule: true,
      sourceMap: isDevelopment,
      modules: {
        auto: true,
        exportLocalsConvention: 'camel-case-only',
        localIdentName: isDevelopment ? '[local]-[hash:8]' : '[hash:8]'
      }
    };
  };

  return [
    {
      oneOf: [
        // The loader for js.
        {
          test: /\.[jt]sx?$/i,
          exclude: /[\\/]node_modules[\\/]/,
          use: [
            {
              loader: 'swc-loader',
              options: swcOptions
            }
          ]
        },
        // The loader for css.
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: getCssLoaderOptions(1)
            },
            {
              loader: 'postcss-loader',
              options: postcssOptions
            }
          ]
        },
        // The loader for scss or sass.
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: getCssLoaderOptions(2)
            },
            {
              loader: 'postcss-loader',
              options: postcssOptions
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment
              }
            }
          ]
        },
        // The loader for assets.
        {
          type: 'asset/resource',
          test: /\.(mp3|ogg|wav|mp4|flv|webm)$/i
        },
        {
          test: /\.svg$/i,
          oneOf: [
            {
              issuer: /\.[jt]sx?$/i,
              type: 'asset/resource',
              resourceQuery: /^\?url$/,
              use: [
                {
                  loader: '@nuintun/svgo-loader',
                  options: svgoOptions
                }
              ]
            },
            {
              issuer: /\.[jt]sx?$/i,
              use: [
                {
                  loader: 'swc-loader',
                  options: swcOptions
                },
                {
                  loader: 'svgc-loader',
                  options: svgoOptions
                }
              ]
            },
            {
              type: 'asset/resource',
              use: [
                {
                  loader: '@nuintun/svgo-loader',
                  options: svgoOptions
                }
              ]
            }
          ]
        },
        {
          type: 'asset/resource',
          test: /\.(png|gif|bmp|ico|jpe?g|webp|woff2?|ttf|eot)$/i
        }
      ]
    }
  ];
};
