/**
 * @module utils
 * @listens MIT
 * @author nuintun
 */

'use strict';

const fs = require('fs');
const crypto = require('crypto');

/**
 * @function getConfigHash
 * @param {string} configPath
 */
module.exports.getConfigHash = function(configPath) {
  const configs = [
    './ip.js',
    './entry.js',
    './utils.js',
    './chunks.js',
    './loaders.js',
    '../configure.js',
    '../webpack.config.base.js'
  ];
  const sha256 = crypto.createHash('sha256');

  configs.forEach(config => sha256.update(fs.readFileSync(require.resolve(config))));

  sha256.update(fs.readFileSync(configPath));

  return sha256.digest('hex');
};
