require('dotenv').config();

const axios = require('axios');
const httpsProxyAgent = require('https-proxy-agent');
const GlobalAgent = require('global-agent');
GlobalAgent.bootstrap();

let axiosConfig = {};
if (process.env.GLOBAL_AGENT_HTTP_PROXY) {
  axiosConfig = {
    proxy: false,
    httpsAgent: new httpsProxyAgent(process.env.GLOBAL_AGENT_HTTP_PROXY)
  }
}

(async () => {
  let serverUrl = process.env.SERVER_URL || '';
  let channelToken = process.env.CHANNEL_TOKEN || '';
  let authToken = process.env.AUTH_TOKEN || '';

  let buildHookUrl = process.env.BUILD_HOOK_URL || '';
  let buildHookBranch = process.env.BUILD_HOOK_BRANCH || '';
  let buildHookTitle = process.env.BUILD_HOOK_TITLE || '';

  if (!buildHookUrl) {
    throw new Error('Build Hook URL is not provided.');
  }

  let payload = {
    SERVER_URL: serverUrl,
    CHANNEL_TOKEN: channelToken,
    AUTH_TOKEN: authToken
  };

  buildHookUrl += '?trigger_title=' + encodeURIComponent(buildHookTitle);
  if (buildHookBranch) {
    buildHookUrl += '&trigger_branch=' + encodeURIComponent(buildHookBranch);
  }

  const response = await axios.post(buildHookUrl, payload, axiosConfig);
  console.log('Done', response);

})();

