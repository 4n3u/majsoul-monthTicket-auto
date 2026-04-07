require('dotenv').config();

const { createHmac, randomUUID } = require('node:crypto');
const protobuf = require('protobufjs/light');
const WebSocket = require('ws');

const DEFAULT_SERVER = 'jp';
const BUY_GREEN_GIFT = false;
const GREEN_GIFT_PRICE_GOLD = 15000;
const GREEN_GIFT_MAX_COUNT_PER_GOODS = 4;
const REVIVE_COIN_GOLD_BONUS = 18000;
const BUY_FROM_ZHP_LIMIT_REACHED_CODE = 2402;
const DEFAULT_DEVICE = {
  platform: 'pc',
  hardware: 'pc',
  os: 'linux',
  os_version: 'linux',
  is_browser: true,
  software: 'Chrome',
  sale_platform: 'web',
  screen_width: 1920,
  screen_height: 1080,
  user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
  screen_type: 2
};

const SERVER_CONFIGS = {
  jp: {
    key: 'jp',
    base: 'https://game.mahjongsoul.com/',
    origin: 'https://game.mahjongsoul.com',
    routeLang: 'jp',
    tag: 'jp',
    loginMode: 'oauth_code',
    oauthType: 21,
    currencyPlatforms: [1, 3, 5, 9, 12]
  },
  en: {
    key: 'en',
    base: 'https://mahjongsoul.game.yo-star.com/',
    origin: 'https://mahjongsoul.game.yo-star.com',
    routeLang: 'en',
    tag: 'en',
    loginMode: 'oauth_code',
    oauthType: 22,
    currencyPlatforms: [1, 4, 5, 9, 12]
  },
  cn: {
    key: 'cn',
    base: 'https://game.maj-soul.com/1/',
    origin: 'https://game.maj-soul.com',
    routeLang: 'chst',
    tag: 'cn',
    loginMode: 'account_password',
    loginType: 0,
    currencyPlatforms: [1, 2, 5, 6, 8, 10, 11]
  }
};

const PROTO_TYPES = {
  Wrapper: 'Wrapper',
  ReqRequestConnection: 'lq.ReqRequestConnection',
  ReqHeartbeat: 'lq.ReqHeartbeat',
  ReqHeatBeat: 'lq.ReqHeatBeat',
  ReqLogin: 'lq.ReqLogin',
  ReqOauth2Auth: 'lq.ReqOauth2Auth',
  ReqOauth2Check: 'lq.ReqOauth2Check',
  ReqOauth2Login: 'lq.ReqOauth2Login',
  ReqBuyFromZHP: 'lq.ReqBuyFromZHP',
  ReqCommon: 'lq.ReqCommon',
  ResRequestConnection: 'lq.ResRequestConnection',
  ResHeartbeat: 'lq.ResHeartbeat',
  ResOauth2Auth: 'lq.ResOauth2Auth',
  ResOauth2Check: 'lq.ResOauth2Check',
  ResOauth2Login: 'lq.ResLogin',
  ResCommon: 'lq.ResCommon',
  ResShopInfo: 'lq.ResShopInfo',
  ResPayMonthTicket: 'lq.ResPayMonthTicket',
  ResFetchMonthTicketInfo: 'lq.ResMonthTicketInfo'
};

const fail = message => {
  throw new Error(message);
};

const must = (value, message) => value || fail(message);
const normalizeBase = raw => {
  const base = must((raw || '').trim(), 'Server base URL must not be empty');
  if (!/^https?:\/\//i.test(base)) {
    fail('Server base URL must start with http:// or https://');
  }
  return base.replace(/\/+$/, '');
};
const buildUrl = (base, path) => `${base}/${path.replace(/^\/+/, '')}`;
const normalizeServerKey = raw => (raw || '').trim().toLowerCase();
const buildRandv = () => {
  const now = Date.now();
  return String(now + Math.floor(Math.random() * now));
};

const hashCnPassword = password =>
  createHmac('sha256', 'lailai').update(password).digest('hex');

function getServerConfig(serverKey) {
  const key = normalizeServerKey(serverKey || DEFAULT_SERVER);
  const server = SERVER_CONFIGS[key];
  if (!server) {
    fail(`Unsupported MS_SERVER "${serverKey}". Use one of: ${Object.keys(SERVER_CONFIGS).join(', ')}`);
  }

  let base = normalizeBase(server.base);
  if (server.key === 'cn' && new URL(base).pathname === '/') {
    base = `${base}/1`;
  }
  return {
    ...server,
    base
  };
}

async function requestJson(url, { body, headers, ...options } = {}) {
  const init = { ...options, headers };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
    if (typeof body !== 'string') {
      init.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers
      };
    }
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    fail(`Request failed ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

function loadProtoTypes(liqiJson) {
  const root = protobuf.Root.fromJSON(liqiJson);
  return Object.fromEntries(
    Object.entries(PROTO_TYPES).map(([key, typeName]) => [key, root.lookupType(typeName)])
  );
}

function encode(type, payload) {
  const error = type.verify(payload);
  if (error) {
    fail(error);
  }
  return type.encode(payload).finish();
}

function buildRoutesUrl(gatewayUrl, version, lang) {
  const url = new URL(`${gatewayUrl.replace(/\/+$/, '')}/api/clientgate/routes`);
  url.searchParams.set('platform', 'Web');
  url.searchParams.set('version', version);
  if (lang) {
    url.searchParams.set('lang', lang);
  }
  url.searchParams.set('randv', buildRandv());
  return url;
}

function shuffle(items) {
  const values = [...items];
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

async function loadServerContext(server) {
  const { base, routeLang } = server;
  const versionUrl = new URL(buildUrl(base, 'version.json'));
  versionUrl.searchParams.set('randv', buildRandv());

  const versionInfo = await requestJson(versionUrl);
  must(versionInfo?.version, `Unexpected version payload: ${JSON.stringify(versionInfo)}`);

  const version = versionInfo.version;
  const versionToForce = version.replace('.w', '');
  const codeDir = must(String(versionInfo.code || '').split('/')[0], 'Missing code directory for config fetch');

  console.log(`version.json -> version=${version} force_version=${versionInfo.force_version} code=${versionInfo.code}`);

  const [config, resManifest] = await Promise.all([
    requestJson(buildUrl(base, `${codeDir}/config.json`)),
    requestJson(buildUrl(base, `resversion${version}.json`))
  ]);

  const liqiPrefix = must(resManifest?.res?.['res/proto/liqi.json']?.prefix, 'liqi prefix missing from resversion manifest');
  console.log(`liqi prefix: ${liqiPrefix}`);

  const gatewayUrl = must(
    config?.ip?.find(entry => Array.isArray(entry?.gateways) && entry.gateways.length)?.gateways?.[0]?.url,
    'Gateway URL missing from config'
  ).replace(/\/+$/, '');

  const [routes, liqiJson] = await Promise.all([
    requestJson(buildRoutesUrl(gatewayUrl, version, routeLang)),
    requestJson(buildUrl(base, `${liqiPrefix.replace(/^\/+/, '')}/res/proto/liqi.json`))
  ]);

  const routeList = routes?.data?.routes?.filter(route => route?.id && route?.domain) ?? [];
  if (!routeList.length) {
    fail('No available gateway servers found.');
  }

  const routesToTry = shuffle(routeList).map(route => ({
    id: route.id,
    endpoint: `wss://${route.domain}/gateway`
  }));
  console.log(`available gateway routes: ${routesToTry.map(route => route.id).join(', ')}`);

  return {
    server,
    base,
    routes: routesToTry,
    version,
    versionToForce,
    proto: loadProtoTypes(liqiJson)
  };
}

async function openChannel(endpoint, origin, Wrapper) {
  const ws = new WebSocket(endpoint, { origin, perMessageDeflate: false });
  const pending = new Map();
  let nextRequestId = 1;

  const settlePending = error => {
    for (const request of pending.values()) {
      clearTimeout(request.timeout);
      request.reject(error);
    }
    pending.clear();
  };

  await new Promise((resolve, reject) => {
    const cleanup = () => {
      ws.removeListener('open', onOpen);
      ws.removeListener('error', onError);
    };
    const onOpen = () => {
      cleanup();
      resolve();
    };
    const onError = error => {
      cleanup();
      reject(error);
    };

    ws.once('open', onOpen);
    ws.once('error', onError);
  });

  ws.on('message', data => {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    if (buffer[0] !== 3) {
      return;
    }

    const requestId = buffer.readUInt16LE(1);
    const request = pending.get(requestId);
    if (!request) {
      return;
    }

    pending.delete(requestId);
    clearTimeout(request.timeout);

    try {
      request.resolve(Wrapper.decode(buffer.subarray(3)));
    } catch (error) {
      request.reject(error);
    }
  });

  ws.on('error', settlePending);
  ws.on('close', () => settlePending(new Error('WebSocket connection closed.')));

  return {
    send(name, payload) {
      const requestId = nextRequestId;
      nextRequestId = (nextRequestId + 1) % 60007 || 1;

      const header = Buffer.alloc(3);
      header.writeUInt8(0x02, 0);
      header.writeUInt16LE(requestId, 1);

      const wrapper = Wrapper.encode(Wrapper.create({ name, data: payload })).finish();
      const packet = Buffer.concat([header, Buffer.from(wrapper)]);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`RPC request timeout for ${name}`));
        }, 15000);

        pending.set(requestId, {
          timeout,
          resolve,
          reject
        });

        ws.send(packet, error => {
          if (!error) {
            return;
          }
          clearTimeout(timeout);
          pending.delete(requestId);
          reject(error);
        });
      });
    },
    async close() {
      if (ws.readyState === WebSocket.CLOSED) {
        return;
      }
      await new Promise(resolve => {
        ws.once('close', resolve);
        ws.close();
      });
    }
  };
}

async function createSessionForRoute(context, route, credentials) {
  const { server, proto, version, versionToForce } = context;
  const { uid, token, email, password } = credentials;
  console.log(`trying gateway route ${route.id}: ${route.endpoint}`);
  const channel = await openChannel(route.endpoint, server.origin, proto.Wrapper);
  const call = async (name, requestType, payload, responseType) => {
    const wrapper = await channel.send(name, encode(requestType, payload));
    return responseType ? responseType.decode(wrapper.data) : wrapper;
  };
  const common = (name, responseType) => call(name, proto.ReqCommon, {}, responseType);

  await call(
    '.lq.Route.requestConnection',
    proto.ReqRequestConnection,
    {
      type: 1,
      route_id: route.id,
      timestamp: Date.now()
    },
    proto.ResRequestConnection
  );
  await call(
    '.lq.Route.heartbeat',
    proto.ReqHeartbeat,
    {
      delay: 0,
      no_operation_counter: 0,
      platform: 11,
      network_quality: 0
    },
    proto.ResHeartbeat
  );

  if (server.loginMode === 'account_password') {
    const loginResponse = await call(
      '.lq.Lobby.login',
      proto.ReqLogin,
      {
        account: email,
        password: hashCnPassword(password),
        reconnect: false,
        device: DEFAULT_DEVICE,
        random_key: randomUUID(),
        client_version: { resource: version },
        gen_access_token: true,
        currency_platforms: server.currencyPlatforms,
        type: server.loginType,
        client_version_string: `web-${versionToForce}`,
        tag: server.tag
      },
      proto.ResOauth2Login
    );
    if (!loginResponse.account) {
      fail('login failed: account not found.');
    }

    return {
      proto,
      common,
      call,
      close: () => channel.close(),
      loginGold: Number(loginResponse.account.gold ?? 0)
    };
  }

  let accessToken = token;
  if (server.loginMode === 'oauth_code') {
    const authResponse = await call(
      '.lq.Lobby.oauth2Auth',
      proto.ReqOauth2Auth,
      {
        type: server.oauthType,
        code: token,
        uid,
        client_version_string: `web-${versionToForce}`
      },
      proto.ResOauth2Auth
    );
    accessToken = must(authResponse?.access_token, `oauth2Auth failed: ${JSON.stringify(authResponse)}`);
  }

  const checkResponse = await call(
    '.lq.Lobby.oauth2Check',
    proto.ReqOauth2Check,
    {
      type: server.oauthType,
      access_token: accessToken
    },
    proto.ResOauth2Check
  );
  if (!checkResponse?.has_account) {
    fail(`oauth2Check failed: ${JSON.stringify(checkResponse)}`);
  }

  const loginResponse = await call(
    '.lq.Lobby.oauth2Login',
    proto.ReqOauth2Login,
    {
      type: server.oauthType,
      access_token: accessToken,
      reconnect: false,
      device: DEFAULT_DEVICE,
      random_key: randomUUID(),
      client_version: { resource: version },
      client_version_string: `web-${versionToForce}`,
      currency_platforms: server.currencyPlatforms,
      tag: server.tag
    },
    proto.ResOauth2Login
  );
  if (!loginResponse.account) {
    fail('oauth2Login failed: account not found.');
  }

  return {
    proto,
    common,
    call,
    close: () => channel.close(),
    loginGold: Number(loginResponse.account.gold ?? 0)
  };
}

async function createSession(context, credentials) {
  const errors = [];

  for (const route of context.routes) {
    try {
      return await createSessionForRoute(context, route, credentials);
    } catch (error) {
      errors.push({ route: route.id, message: error?.message || String(error) });
      console.warn(`gateway route ${route.id} failed: ${error?.message || error}`);
    }
  }

  fail(`All gateway routes failed: ${JSON.stringify(errors)}`);
}

async function runActions(session) {
  const { proto, common, call, loginGold } = session;
  console.log('oauth2Login.account.gold:', loginGold);

  const payResponse = await common('.lq.Lobby.payMonthTicket', proto.ResPayMonthTicket);
  console.log('payMonthTicket:', JSON.stringify(payResponse));

  const infoResponse = await common('.lq.Lobby.fetchMonthTicketInfo', proto.ResFetchMonthTicketInfo);
  console.log('fetchMonthTicketInfo:', JSON.stringify(infoResponse));

  if (!BUY_GREEN_GIFT) {
    return;
  }

  const gainReviveCoinResponse = await common('.lq.Lobby.gainReviveCoin', proto.ResCommon);
  const gainReviveCoinErrorCode = Number(gainReviveCoinResponse?.error?.code ?? 0);
  if (gainReviveCoinErrorCode === 0) {
    console.log('gainReviveCoin: success');
  } else {
    console.log('gainReviveCoin: skipped', JSON.stringify(gainReviveCoinResponse));
  }

  const latestGold = loginGold + (gainReviveCoinErrorCode === 0 ? REVIVE_COIN_GOLD_BONUS : 0);
  console.log('estimatedGoldForPurchase:', latestGold);

  const shopInfoResponse = await common('.lq.Lobby.fetchShopInfo', proto.ResShopInfo);
  const zhpGoods = shopInfoResponse.shop_info?.zhp?.goods;
  if (!zhpGoods) {
    fail('fetchShopInfo failed: shop_info.zhp not found.');
  }
  console.log('fetchShopInfo.shop_info.zhp.goods:', JSON.stringify(zhpGoods));

  const greenGoodsIds = zhpGoods.slice(0, 4).map(Number).filter(id => Number.isInteger(id) && id > 0);
  const maxTotalBuyable = Math.floor(latestGold / GREEN_GIFT_PRICE_GOLD);
  let remainingPurchaseCount = Math.min(maxTotalBuyable, greenGoodsIds.length * GREEN_GIFT_MAX_COUNT_PER_GOODS);
  let spentGold = 0;
  const purchasePlan = [];

  for (const goodsId of greenGoodsIds) {
    if (remainingPurchaseCount <= 0) {
      break;
    }

    const count = Math.min(GREEN_GIFT_MAX_COUNT_PER_GOODS, remainingPurchaseCount);
    const buyResponse = await call(
      '.lq.Lobby.buyFromZHP',
      proto.ReqBuyFromZHP,
      { goods_id: goodsId, count },
      proto.ResCommon
    );
    const errorCode = Number(buyResponse?.error?.code ?? 0);

    if (errorCode === BUY_FROM_ZHP_LIMIT_REACHED_CODE) {
      console.log(
        `buyFromZHP: skip all purchases for this run (goods_id=${goodsId}, count=${count}, purchase limit reached):`,
        JSON.stringify(buyResponse)
      );
      break;
    }
    if (errorCode !== 0) {
      fail(`buyFromZHP failed for goods_id=${goodsId} count=${count}: ${JSON.stringify(buyResponse)}`);
    }

    purchasePlan.push({ goods_id: goodsId, count });
    remainingPurchaseCount -= count;
    spentGold += count * GREEN_GIFT_PRICE_GOLD;
  }

  console.log('buyFromZHP.purchasePlan:', JSON.stringify(purchasePlan));
  console.log('buyFromZHP.spentGold:', spentGold);
  console.log('buyFromZHP.remainingGoldEstimate:', Math.max(0, latestGold - spentGold));
}

function loadRuntimeConfig() {
  const server = getServerConfig(process.env.MS_SERVER);
  const uid = process.env.UID;
  const token = process.env.TOKEN;
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (server.loginMode === 'account_password') {
    if (!email || !password) {
      fail('EMAIL and PASSWORD environment variables are required for CN server.');
    }
  } else if (!uid || !token) {
    fail('UID and TOKEN environment variables are required for JP/EN servers.');
  }

  return {
    uid,
    token,
    email,
    password,
    server
  };
}

async function run() {
  const credentials = loadRuntimeConfig();
  const { server } = credentials;
  console.log(`selected server: ${server.key}`);
  const context = await loadServerContext(server);
  const session = await createSession(context, credentials);

  try {
    await runActions(session);
  } finally {
    await session.close();
  }
}

run().catch(error => {
  console.error(error?.stack || error.message);
  process.exitCode = 1;
});
