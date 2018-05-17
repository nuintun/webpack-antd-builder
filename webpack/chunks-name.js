const crypto = require('crypto');

const cache = new Map();

const hashFilename = name => {
  return crypto
    .createHash('md4')
    .update(name)
    .digest('hex')
    .slice(0, 8);
};

module.exports = (module, chunks, cacheGroup) => {
  console.log(module.nameForCondition());
  chunks.forEach(chunk => {
    console.log(chunk.name);
  });
  console.log('---------------------------------------------');

  let cacheEntry = cache.get(chunks);

  if (cacheEntry === undefined) {
    cache.set(chunks, (cacheEntry = {}));
  } else if (cacheGroup in cacheEntry) {
    return cacheEntry[cacheGroup];
  }

  const names = chunks.map(chunk => chunk.debugId);

  if (!names.every(Boolean)) {
    return (cacheEntry[cacheGroup] = undefined);
  }

  names.sort();

  let name = names.join('&');

  // Filenames and paths can't be too long otherwise an
  // ENAMETOOLONG error is raised. If the generated name if too
  // long, it is truncated and a hash is appended. The limit has
  // been set to 100 to prevent `[name].[chunkhash].[ext]` from
  // generating a 256+ character string.
  // if (name.length > 100) {
  //   name = name.slice(0, 100) + '&' + hashFilename(name);
  // }

  name = hashFilename(name);

  cacheEntry[cacheGroup] = name;

  return name;
};
