/**
 * @module rules
 * @description 配置 Webpack 规则
 */

import swcrc from '../../.swcrc.ts';
import svgorc from '../../.svgorc.ts';
import postcssrc from '../../.postcssrc.ts';
import type { Configuration } from 'webpack';
import type { GetProp, Mode } from '../index.ts';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/**
 * @typedef Rules
 * @description Webpack 模块规则类型，从 Configuration 中提取的 rules 属性类型
 */
type Rules = GetProp<GetProp<Configuration, 'module'>, 'rules'>;

/**
 * @function resolveRules
 * @description 根据打包模式生成 Webpack 的模块处理规则配置
 * @param mode 打包模式，'development' 或 'production'，影响 sourceMap 和类名生成策略
 */
export default async function (mode: Mode): Promise<Rules> {
  const isDevelopment = mode !== 'production';
  const swcOptions = { ...(await swcrc(mode)), swcrc: false };
  const postcssOptions = {
    sourceMap: isDevelopment,
    postcssOptions: { ...(await postcssrc(mode)), config: false }
  };
  const svgoOptions = { ...(await svgorc(mode)), configFile: false };

  /**
   * @function getCssLoaderOptions
   * @description 生成 CSS Loader 的配置选项
   * @param importLoaders 设置在 css-loader 之前应用的 loader 数量
   */
  const getCssLoaderOptions = (importLoaders: number) => {
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
}
