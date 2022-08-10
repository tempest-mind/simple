const fs = require('fs').promises;
const path = require('path')
const indexFile = 'dist/index.html';

(async () => {
  let html = await fs.readFile(path.join(indexFile), 'utf8');
  let TOML_FILE_VAR = process.env.TOML_FILE_VAR || '';
  let SITE_ENV_VAR = process.env.SITE_ENV_VAR || '';
  let INCOMING_HOOK_BODY  = process.env.INCOMING_HOOK_BODY || '';
  console.log('TOML_FILE_VAR', TOML_FILE_VAR);
  console.log('SITE_ENV_VAR', SITE_ENV_VAR);
  console.log('INCOMING_HOOK_BODY', INCOMING_HOOK_BODY);
  if (INCOMING_HOOK_BODY) {
    try {
      INCOMING_HOOK_BODY = JSON.parse(INCOMING_HOOK_BODY);
    }
    catch(e) {
      console.log('Unable to parse json', INCOMING_HOOK_BODY);
    }
  }
  html = html.replace('<!--TOML_FILE_VAR-->', TOML_FILE_VAR);
  html = html.replace('<!--SITE_ENV_VAR-->', SITE_ENV_VAR);
  if (typeof INCOMING_HOOK_BODY === 'object') {
    INCOMING_HOOK_BODY = JSON.stringify(INCOMING_HOOK_BODY, null, 2);
  }
  html = html.replace('<!--INCOMING_HOOK_BODY-->', INCOMING_HOOK_BODY);
  await fs.writeFile(indexFile, html);
})();

