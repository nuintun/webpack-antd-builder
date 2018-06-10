/**
 * @module port
 * @listens MIT
 * @author nuintun
 * @description Get webpack dev server port.
 */

'use strict';

/**
 * @function getPort
 * @param portArgv
 * @return {number}
 */
module.exports = portArgv => {
  const portMatched = /(-p|--port)=(\d+)/.exec(portArgv);

  if (!portArgv) {
    throw new ReferenceError('Webpack dev server port is required');
  }

  const port = portMatched[2] >>> 0;

  if (!port || port !== port || port > 0xffff) {
    throw new RangeError('Webpack dev server port must be a legal port <1-65535>');
  }

  return port;
};
