/**
 * @module interface
 * @description 类型定义
 */

import type { Configuration } from 'webpack';
import type { Options } from 'webpack-dev-service';
import type { Plugin, ProcessOptions } from 'postcss';

/**
 * @description Env 配置
 */
type Env = Record<string, unknown>;

/**
 * @description Env 配置函数
 */
interface EnvFunction {
  (mode: string, env: Env): Env | Promise<Env>;
}

/**
 * @description 获取对象指定属性非空类型
 */
type Prop<T, K extends keyof T> = NonNullable<T[K]>;

/**
 * @description Swc 配置
 */
export { Options as SwcConfig } from '@swc/core';

/**
 * @description Webpack 文件系统
 */
export type FileSystem = NonNullable<Options['fs']>;

/**
 * @description Postcss 配置
 */
export interface PostcssConfig extends ProcessOptions {
  plugins?: Plugin[];
  sourceMap?: boolean;
}

/**
 * @description Svgo 配置
 */
export { SvgoOptions as SvgoConfig } from 'svgc-loader';

/**
 * @description App 配置
 */
export interface AppConfig extends Pick<Configuration, 'context' | 'plugins' | 'externals'> {
  lang: string;
  name: string;
  favicon: string;
  entryHTML: string;
  env?: Env | EnvFunction;
  meta?: Record<string, string>;
  entry: Prop<Configuration, 'entry'>;
  ports: [start: number, end?: number] | number;
  alias?: Prop<Prop<Configuration, 'resolve'>, 'alias'>;
  outputPath: Prop<Prop<Configuration, 'output'>, 'path'>;
  publicPath?: Prop<Prop<Configuration, 'output'>, 'publicPath'>;
}
