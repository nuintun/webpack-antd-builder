/**
 * @module entry
 * @listens MIT
 * @author nuintun
 * @description Get entry.
 */

'use strict';

const path = require('path');
const WebpackGlobEntriesPlugin = require('webpack-glob-entries-plugin');

const polyfills = require.resolve('./polyfills');

/**
 * @function globEntry
 * @param {string} entry
 * @param {string} entryBasePath
 * @param {Array} commonEntry
 */
module.exports = function(entry, entryBasePath, commonEntry = []) {
  return new WebpackGlobEntriesPlugin(entry, {
    mapEntryName: file => {
      const extname = path.extname(file);
      const extnameLength = extname.length;

      let entryName = path.relative(entryBasePath, file);

      if (extnameLength) {
        entryName = entryName.slice(0, -extnameLength);
      }

      return entryName;
    },
    mapEntry: file => {
      return [polyfills, ...commonEntry, file];
    }
  });
};
