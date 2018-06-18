/**
 * @module build
 * @listens MIT
 * @author nuintun
 * @description Build html from manifest.json, only for tests.
 */

const fs = require('fs-extra');
const manifest = require('./Assets/dist/manifest.json');

/**
 * @function createHTML
 * @param {Object} entry
 */
const createHTML = entry => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Index</title>
    ${entry.css.map(css => `<link rel="stylesheet" type="text/css" href="${css}" />`).join('\n    ')}
  </head>
  <body>
    <div id="app"></div>
    <script src="//as.alipayobjects.com/g/component/??es6-shim/0.35.1/es6-shim.min.js"></script>
    ${entry.js.map(js => `<script src="${js}"></script>`).join('\n    ')}
  </body>
</html>
`;

Object.keys(manifest).forEach(page => {
  const entry = manifest[page];

  const html = createHTML(entry);

  const output = `public/${page}.html`;

  fs.outputFile(output, html.trim(), () => {
    console.log(`Build ${output} success!`);
  });
});
