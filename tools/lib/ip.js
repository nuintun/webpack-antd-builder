/**
 * @module ip
 * @description 获取本机 IP 地址
 */

import os from 'os';

/**
 * @function isLinkLocal
 * @param {string} address
 * @returns {boolean}
 */
function isLinkLocal(address) {
  return /^fe80:/i.test(address);
}

/**
 * @function resolveIp
 * @param {boolean} ipv6
 * @return {Promise<string>}
 */
export default (ipv6 = false) => {
  const expectFamily = ipv6 ? 'IPv6' : 'IPv4';
  const networkInterfaces = os.networkInterfaces();
  const interfaces = Object.keys(networkInterfaces);

  for (const face of interfaces) {
    const networkInterface = networkInterfaces[face];

    for (const { family, address, internal } of networkInterface) {
      if (!internal && family === expectFamily) {
        if (ipv6 && isLinkLocal(address)) {
          continue;
        }

        return address;
      }
    }
  }

  return ipv6 ? '::1' : '127.0.0.1';
};
