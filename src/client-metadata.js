const DEFAULT_RESOURCE_VERSION = '0.16.193';

function parseProductVersion(html) {
  const match = String(html || '').match(/productVersion\s*:\s*["']([^"']+)["']/);
  if (!match?.[1]) {
    throw new Error('Unity productVersion not found in index.html');
  }
  return match[1];
}

function buildClientMetadata({ productVersion, resourceVersion = DEFAULT_RESOURCE_VERSION }) {
  if (!productVersion) {
    throw new Error('productVersion is required');
  }
  if (!resourceVersion) {
    throw new Error('resourceVersion is required');
  }

  return {
    routeVersion: productVersion,
    clientVersion: {
      resource: resourceVersion,
      package: productVersion
    },
    clientVersionString: `WebGL_2022-${resourceVersion}`
  };
}

function buildOauth2AuthPayload({ oauthType, token, uid, clientVersionString }) {
  return {
    type: oauthType,
    code: token,
    uid,
    client_version_string: clientVersionString
  };
}

function buildOauth2LoginPayload({
  oauthType,
  accessToken,
  device,
  randomKey,
  clientVersion,
  clientVersionString,
  currencyPlatforms,
  tag
}) {
  return {
    type: oauthType,
    access_token: accessToken,
    reconnect: false,
    device,
    random_key: randomKey,
    client_version: clientVersion,
    client_version_string: clientVersionString,
    currency_platforms: currencyPlatforms,
    tag
  };
}

function buildPasswordLoginPayload({
  account,
  password,
  device,
  randomKey,
  clientVersion,
  clientVersionString,
  currencyPlatforms,
  loginType,
  tag
}) {
  return {
    account,
    password,
    reconnect: false,
    device,
    random_key: randomKey,
    client_version: clientVersion,
    gen_access_token: true,
    currency_platforms: currencyPlatforms,
    type: loginType,
    client_version_string: clientVersionString,
    tag
  };
}

module.exports = {
  DEFAULT_RESOURCE_VERSION,
  buildClientMetadata,
  buildOauth2AuthPayload,
  buildOauth2LoginPayload,
  buildPasswordLoginPayload,
  parseProductVersion
};
