/**
 * @module less2js
 * @listens MIT
 * @author nuintun
 * @description 将 Less 变量解析为 json 数据
 * @see https://github.com/paulmorar/cast-less-vars-to-json
 */

import less from 'less';

const { parse, contexts } = less;

/**
 * @function less2js
 * @param {string} code
 * @param {object} options
 * @return {Promise<object>}
 */
export default (code = '', options = {}) => {
  return new Promise((resolve, reject) => {
    const { config, serialize } = options;
    const hasSerialize = typeof serialize === 'function';

    parse(code, config, (error, root, _imports, config) => {
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
