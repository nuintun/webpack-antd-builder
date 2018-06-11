/**
 * @module port
 * @listens MIT
 * @author nuintun
 * @description Get webpack dev server port.
 */

'use strict';

const PORT_RE = /(-p|--port)=(\d+)/;

/**
 * @function getPort
 * @param {Array} argv
 * @return {number}
 */
module.exports = argv => {
  const portArgvs = argv.filter(argv => PORT_RE.test(argv));

  if (!portArgvs.length) {
    throw new ReferenceError('Webpack dev server port is required');
  }

  const portArgv = portArgvs.pop();
  const portMatched = PORT_RE.exec(portArgv);
  const port = portMatched[2] >>> 0;

  if (!port || port !== port || port > 0xffff) {
    throw new RangeError('Webpack dev server port must be a legal port <1-65535>');
  }

  return port;
};
