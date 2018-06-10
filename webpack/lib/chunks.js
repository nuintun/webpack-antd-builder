/**
 * @module chunks
 * @listens MIT
 * @author nuintun
 * @description Create chunks name.
 * @see https://github.com/webpack/webpack/blob/master/lib/optimize/SplitChunksPlugin.js
 */

'use strict';

const crypto = require('crypto');

/**
 * @function hashFilename
 * @param {string} name
 * @returns {string}
 */
const hashFilename = name => {
  return crypto
    .createHash('md4')
    .update(name)
    .digest('hex')
    .slice(0, 8);
};

/**
 * @function getChunksName
 * @param {string} prefix
 * @param {string} delimiter
 * @returns {Function}
 */
module.exports = (prefix, delimiter = '&') => {
  const cache = new Map();

  /**
   * @function chunksName
   * @param {Module} module
   * @param {Chunk} chunks
   * @param {string} cacheGroup
   * @returns {string}
   */
  return (module, chunks, cacheGroup) => {
    if (!cache.has(chunks)) {
      cache.set(chunks, Object.create(null));
    }

    const cacheEntry = cache.get(chunks);

    if (cacheGroup in cacheEntry) {
      return cacheEntry[cacheGroup];
    }

    const names = chunks.map(chunk => chunk.name);

    if (names.every(Boolean)) {
      names.sort();

      let name = names.join(delimiter);

      name = `${prefix}-${hashFilename(name)}`;

      cacheEntry[cacheGroup] = name;

      return name;
    }
  };
};
