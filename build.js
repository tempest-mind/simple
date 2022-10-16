require('dotenv').config();
const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path')
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

const distDir = 'dist/'
const indexFile = path.join(distDir, 'index.html');
const assetName = '404-test.png';
const assetPath = path.join(distDir, assetName);
const assetId = 'CONT4778DFFB40034B7485389B8B41A96427';

const axios = require('axios');
const httpsProxyAgent = require('https-proxy-agent');
const GlobalAgent = require('global-agent');
GlobalAgent.bootstrap();

let proxySettings = {};
if (process.env.GLOBAL_AGENT_HTTP_PROXY) {
  proxySettings = {
    proxy: false,
    httpsAgent: new httpsProxyAgent(process.env.GLOBAL_AGENT_HTTP_PROXY)
  }
}

// Returns IMG outerHtml if asset is successfully downloaded.
let download = async (serverUrl, channelToken, authToken) => {
  try {
    if (!serverUrl || !channelToken) {
      console.error('Missing asset configuration (serverUrl or channelToken)');
      return '(No asset.)';
    }
    let url = '';
    let api = '';
    let isPreview = Boolean(authToken);
    console.log('authToken', authToken);
    console.log('isPreview', isPreview);
    if (isPreview) {
      api = '/content/preview/api/v1.1/assets/';
      proxySettings = Object.assign(proxySettings, {
        headers: {
          'authorization': 'Bearer ' + authToken,
          'content-type': 'application/json'
        }
      })
    }
    else {
      api = '/content/published/api/v1.1/assets/';
    }
    url = serverUrl + api + assetId + '/native/' + assetName + '?channelToken=' + channelToken;
    console.log('url', url);

    const response = await axios.get(url, Object.assign(proxySettings, {
      responseType: 'stream'
    }));
    await pipeline(response.data, fs.createWriteStream(assetPath));
    console.log('Download successful...');
    return '<img src="'+ assetName +'">';
  } catch(e) {
    console.error('Download failed.', e);
    return '(No asset.)';
  }
};

(async () => {
  let html = await fsPromise.readFile(path.join(indexFile), 'utf8');
  let TOML_FILE_VAR = process.env.TOML_FILE_VAR || '';
  let SITE_ENV_VAR = process.env.SITE_ENV_VAR || '';
  let INCOMING_HOOK_BODY  = process.env.INCOMING_HOOK_BODY || '';
  let INCOMING_HOOK_TITLE  = process.env.INCOMING_HOOK_TITLE || 'Environment Test';
  let isEoBuild = /^TGT.*_/.test(INCOMING_HOOK_TITLE);
  INCOMING_HOOK_TITLE = INCOMING_HOOK_TITLE.replace(/^(TGT.*)_(.*)/, '$2 (<i>$1</i>)');
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
  let serverUrl = (INCOMING_HOOK_BODY && INCOMING_HOOK_BODY.SERVER_URL) || process.env.SERVER_URL || '';
  let channelToken = (INCOMING_HOOK_BODY && INCOMING_HOOK_BODY.CHANNEL_TOKEN) || process.env.CHANNEL_TOKEN || '';
  let authToken = (INCOMING_HOOK_BODY && INCOMING_HOOK_BODY.AUTH_TOKEN) || process.env.AUTH_TOKEN || '';
  let img = await download(serverUrl, channelToken, authToken);
  
  // Convert to string
  if (typeof INCOMING_HOOK_BODY === 'object') {
    INCOMING_HOOK_BODY = JSON.stringify(INCOMING_HOOK_BODY, null, 2);
  }

  html = html.replace('<!--ASSET-->', img);
  html = html.replace('<!--TOML_FILE_VAR-->', TOML_FILE_VAR);
  html = html.replace('<!--SITE_ENV_VAR-->', SITE_ENV_VAR);
  html = html.replace('<!--INCOMING_HOOK_TITLE-->', INCOMING_HOOK_TITLE);
  html = html.replace('<!--INCOMING_HOOK_BODY-->', INCOMING_HOOK_BODY);
  html = html.replace('<!--env-->', JSON.stringify(process.env, null, 2));
  html = html.replace('<!--type-->', isEoBuild ? 'EO  (Content Update or Test Button)' : 'Developer (Code Update)');
  await fsPromise.writeFile(indexFile, html);
})();

