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
  const sha256 = crypto.createHash('sha256');
  const baseConfigPath = require.resolve('../webpack.config.base.js');

  sha256.update(fs.readFileSync(baseConfigPath));
  sha256.update(fs.readFileSync(configPath));

  return sha256.digest('hex');
};
