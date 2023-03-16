/**
 * @module interface
 * @description 类型定义
 */

import { Configuration } from 'webpack';
import { Plugin, ProcessOptions } from 'postcss';

/**
 * @description Swc 配置
 */
export { Options as SwcConfig } from '@swc/core';

/**
 * @description Env 配置
 */
type Env = Record<string, unknown>;

/**
 * @description 获取对象指定属性非空类型
 */
type Prop<T, K extends keyof T> = NonNullable<T[K]>;

/**
 * @description Env 配置函数
 */
type EnvFunction = (isDevelopment: boolean, env: Env) => Env | Promise<Env>;

/**
 * @description Postcss 配置
 */
export interface PostcssConfig extends ProcessOptions {
  plugins?: Plugin[];
  sourceMap?: boolean;
}

/**
 * @description App 配置
 */
export interface AppConfig extends Pick<Configuration, 'context' | 'externals'> {
  lang: string;
  name: string;
  favicon: string;
  entryHTML: string;
  outputPath: string;
  publicPath?: string;
  env?: Env | EnvFunction;
  meta?: Record<string, string>;
  entry: Prop<Configuration, 'entry'>;
  alias?: Prop<Prop<Configuration, 'resolve'>, 'alias'>;
}
