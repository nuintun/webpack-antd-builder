/**
 * @module .swcrc
 * @description SWC 配置
 */

import browsers from './webpack/lib/browsers.js';

export default async () => {
  return {
    env: {
      targets: await browsers()
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
