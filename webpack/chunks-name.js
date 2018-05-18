/**
 * @module chunks-name
 * @listens MIT
 * @author nuintun
 * @description Create chunks name.
 */

'use strict';

const crypto = require('crypto');

const cache = new Map();

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
 * @function chunksName
 * @param {Module} module
 * @param {Chunk} chunks
 * @param {string} cacheGroup
 * @returns {string}
 */
module.exports = (module, chunks, cacheGroup) => {
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

    let name = names.join('&');

    name = 'chunk-' + hashFilename(name);

    cacheEntry[cacheGroup] = name;

    return name;
  }
};
