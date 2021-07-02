/**
 * @module url
 * @listens MIT
 * @author nuintun
 * @description URL loader use assets modules.
 */

/**
 * @function url
 * @returns {string}
 */
module.exports = function () {
  const path = JSON.stringify(this.resourcePath);

  return `export default new URL(${path}, import.meta.url).toString();`;
};
