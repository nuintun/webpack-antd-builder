/**
 * @module less2js
 * @listens MIT
 * @author nuintun
 * @see https://github.com/paulmorar/cast-less-vars-to-json
 * @description Cast less variables into JSON key-value pairs.
 */

'use strict';

const { parse, contexts } = require('less');

/**
 * @function less2js
 * @param {string} source
 * @param {object} options
 * @returns {object}
 */
module.exports = (source = '', options = {}) => {
  return new Promise((resolve, reject) => {
    const { config, serialize } = options;
    const hasSerialize = typeof serialize === 'function';

    parse(source, config, (error, root, _imports, config) => {
      if (error) return reject(error);

      const { rules } = root.eval(new contexts.Eval(config));

      resolve(
        rules.reduce((vars, node) => {
          if (node.variable) {
            const name = hasSerialize ? serialize(node.name) : node.name;

            return { ...vars, [name]: node.value.toCSS(config) };
          }

          return vars;
        }, {})
      );
    });
  });
};
