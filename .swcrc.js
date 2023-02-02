/**
 * @module .swcrc
 * @description SWC 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @return {Promise<import('./tools/interface').SwcConfig>}
 */
export default async () => {
  return {
    env: {
      targets: await targets()
    },
    jsc: {
      target: 'es2015',
      externalHelpers: true,
      parser: {
        tsx: true,
        syntax: 'typescript'
      },
      transform: {
        react: {
          runtime: 'automatic'
        }
      }
    }
  };
};
