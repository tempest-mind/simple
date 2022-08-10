const fs = require('fs').promises;
const path = require('path')
const indexFile = 'dist/index.html';

(async () => {
  console.log('fs', fs);
  console.log('path', path);
  console.log('indexFile', indexFile);
  console.log('path.join(indexFile)', path.join(indexFile));
  let html = await fs.readFile(path.join(indexFile), 'utf8');
  console.log('html', html);
  let VAR_TOML_FILE = process.env.VAR_TOML_FILE || '';
  console.log('VAR_TOML_FILE', VAR_TOML_FILE);
  let VAR_NETLIFY_CREATE = process.env.VAR_NETLIFY_CREATE || '';
  console.log('VAR_NETLIFY_CREATE', VAR_NETLIFY_CREATE);
  let INCOMING_HOOK_BODY  = process.env.INCOMING_HOOK_BODY || '';
  console.log('INCOMING_HOOK_BODY', INCOMING_HOOK_BODY);
  if (INCOMING_HOOK_BODY) {
    try {
      INCOMING_HOOK_BODY = JSON.parse(INCOMING_HOOK_BODY);
    }
    catch(e) {
      console.log('Unable to parse json', INCOMING_HOOK_BODY);
    }
  }
  html = html.replace('<!--VAR_TOML_FILE-->', VAR_TOML_FILE);
  html = html.replace('<!--VAR_NETLIFY_CREATE-->', VAR_NETLIFY_CREATE);
  if (typeof INCOMING_HOOK_BODY === 'object') {
    html = html.replace('<!--INCOMING_HOOK_BODY-->', JSON.stringify(INCOMING_HOOK_BODY, null, 2));
  }
  else { // Just place the string value
    html = html.replace('<!--INCOMING_HOOK_BODY-->', INCOMING_HOOK_BODY);
  }
  console.log('html', html);
  await fs.writeFile(indexFile, html);
})();

