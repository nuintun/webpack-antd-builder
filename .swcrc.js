/**
 * @module .swcrc
 * @description SWC 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @return {Promise<import('@swc/core').Options>}
 */
export default async () => {
  return {
    env: {
      targets: await targets()
    },
    jsc: {
      parser: {
        tsx: true,
        syntax: 'typescript'
      },
      transform: {
        react: {
          runtime: 'automatic'
        }
      },
      externalHelpers: true
    }
  };
};
