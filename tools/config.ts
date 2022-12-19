/**
 * @module config
 */

import { Configuration } from 'webpack';

type Prop<T, K extends keyof T> = NonNullable<T[K]>;

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
  meta?: Record<string, string>;
  entry: Prop<Configuration, 'entry'>;
  alias?: Prop<Prop<Configuration, 'resolve'>, 'alias'>;
}
