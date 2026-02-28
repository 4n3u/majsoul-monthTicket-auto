require('dotenv').config();

const { randomUUID } = require('node:crypto');
const protobuf = require('protobufjs/light');
const WebSocket = require('ws');

const DEFAULT_BASE = 'https://game.mahjongsoul.com/';


// If true, attempt to claim the daily revive coin once and buy as many green gifts as possible with available coin.
// Use this only for Master rank or above accounts.
const BUY_GREEN_GIFT = false;

const GREEN_GIFT_PRICE_GOLD = 15000;
const GREEN_GIFT_MAX_COUNT_PER_GOODS = 4;
const REVIVE_COIN_GOLD_BONUS = 18000;
const BUY_FROM_ZHP_LIMIT_REACHED_CODE = 2402;

function normalizeBase(raw) {
  const value = (raw || '').trim();
  if (!value) {
    throw new Error('MS_HOST must not be empty');
  }
  if (!/^https?:\/\//i.test(value)) {
    throw new Error('MS_HOST must start with http:// or https://');
  }
  return value.replace(/\/+$/, '');
}

function buildUrl(base, relative) {
  return `${base}/${relative.replace(/^\/+/, '')}`;
}

function buildRandv() {
  const now = Date.now();
  return String(now + Math.floor(Math.random() * now));
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function fetchText(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} ${response.statusText} for ${url}`);
  }
  return response.text();
}

async function fetchVersion(base) {
  const url = new URL(buildUrl(base, 'version.json'));
  url.searchParams.set('randv', buildRandv());
  const payload = await fetchJson(url);
  if (!payload?.version) {
    throw new Error(`Unexpected version payload: ${JSON.stringify(payload)}`);
  }
  return payload;
}

function extractCodeDirectory(code) {
  if (typeof code !== 'string' || !code.includes('/')) {
    return code || '';
  }
  const [first] = code.split('/');
  return first || code;
}

async function fetchConfig(base, codeDir) {
  if (!codeDir) {
    throw new Error('Missing code directory for config fetch');
  }
  const url = buildUrl(base, `${codeDir}/config.json`);
  const text = await fetchText(url);
  return JSON.parse(text);
}

async function fetchResVersion(base, version) {
  if (!version) {
    throw new Error('Missing version string for resversion fetch');
  }
  const url = buildUrl(base, `resversion${version}.json`);
  return fetchJson(url);
}

async function fetchLiqi(base, prefix) {
  if (!prefix) {
    throw new Error('Missing liqi prefix from manifest');
  }
  const cleaned = prefix.replace(/^\/+/, '');
  const url = buildUrl(base, `${cleaned}/res/proto/liqi.json`);
  const text = await fetchText(url);
  return JSON.parse(text);
}

function loadProtoTypes(liqiJson) {
  const root = protobuf.Root.fromJSON(liqiJson);



    return {
      Wrapper: root.lookupType('Wrapper'),
      ReqHeatBeat: root.lookupType('lq.ReqHeatBeat'),
      ReqOauth2Auth: root.lookupType('lq.ReqOauth2Auth'),
      ReqOauth2Login: root.lookupType('lq.ReqOauth2Login'),
      ReqBuyFromZHP: root.lookupType('lq.ReqBuyFromZHP'),
      ReqCommon: root.lookupType('lq.ReqCommon'),
      ResOauth2Auth: root.lookupType('lq.ResOauth2Auth'),
      ResOauth2Login: root.lookupType('lq.ResLogin'),
      ResCommon: root.lookupType('lq.ResCommon'),
      ResShopInfo: root.lookupType('lq.ResShopInfo'),
      ResPayMonthTicket: root.lookupType('lq.ResPayMonthTicket'),
    ResFetchMonthTicketInfo: root.lookupType('lq.ResMonthTicketInfo')
  };
}

async function fetchGatewayDomains(gatewayUrl) {
  const normalized = gatewayUrl.replace(/\/+$/, '');
  const url = `${normalized}/api/clientgate/routes`;
  const routes = await fetchJson(url);
  const servers = routes?.data?.routes?.map(route => route.domain).filter(Boolean) ?? [];
  if (!servers.length) {
    throw new Error('No available gateway servers found.');
  }
  return servers;
}

function pickGatewayUrl(config) {
  const entries = Array.isArray(config?.ip) ? config.ip : [];
  for (const entry of entries) {
    if (Array.isArray(entry?.gateways) && entry.gateways.length > 0) {
      return entry.gateways[0].url;
    }
  }
  throw new Error('Gateway URL missing from config');
}

function getPassportUrl(config) {
  const value = Array.isArray(config?.yo_service_url) ? config.yo_service_url[0] : null;
  if (!value) {
    throw new Error('Passport service URL missing from config');
  }
  return value.replace(/\/+$/, '');
}

async function passportLogin(passportUrl, uid, token) {
  const url = `${passportUrl}/user/login`;
  const payload = {
    uid,
    token,
    deviceId: `web|${uid}`
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Passport login failed ${response.status} ${response.statusText}`);
  }
  const body = await response.json();
  if (!body?.accessToken) {
    throw new Error(`Passport response missing accessToken: ${JSON.stringify(body)}`);
  }
  return body.accessToken;
}

class MSRPCChannel {
  constructor(endpoint, origin, Wrapper) {
    this.endpoint = endpoint;
    this.origin = origin;
    this.Wrapper = Wrapper;
    this.requestId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.endpoint, {
      origin: this.origin,
      perMessageDeflate: false
    });

    await new Promise((resolve, reject) => {
      const cleanup = () => {
        this.ws.removeListener('open', onOpen);
        this.ws.removeListener('error', onError);
      };

      const onOpen = () => {
        cleanup();
        resolve();
      };

      const onError = err => {
        cleanup();
        reject(err);
      };

      this.ws.once('open', onOpen);
      this.ws.once('error', onError);
    });

    this.ws.on('message', data => this.handleMessage(data));
    this.ws.on('error', err => {
      for (const pending of this.pending.values()) {
        pending.reject(err);
      }
      this.pending.clear();
    });
    this.ws.on('close', () => {
      const error = new Error('WebSocket connection closed.');
      for (const pending of this.pending.values()) {
        pending.reject(error);
      }
      this.pending.clear();
    });
  }

  async close() {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      return;
    }
    await new Promise(resolve => {
      this.ws.once('close', resolve);
      this.ws.close();
    });
  }

  handleMessage(data) {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const typeByte = buffer[0];

    if (typeByte !== 3) {
      return;
    }

    const requestId = buffer.readUInt16LE(1);
    const wrapperData = buffer.subarray(3);

    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }
    this.pending.delete(requestId);

    try {
      const message = this.Wrapper.decode(wrapperData);
      pending.resolve(message);
    } catch (err) {
      pending.reject(err);
    }
  }

  sendRequest(name, payload) {
    const requestId = this.requestId;
    this.requestId = (this.requestId + 1) % 60007 || 1;

    const wrapper = this.Wrapper.create({
      name,
      data: payload
    });
    const wrapperBytes = this.Wrapper.encode(wrapper).finish();

    const header = Buffer.alloc(3);
    header.writeUInt8(0x02, 0);
    header.writeUInt16LE(requestId, 1);

    const packet = Buffer.concat([header, Buffer.from(wrapperBytes)]);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error(`RPC request timeout for ${name}`));
      }, 15000);

      this.pending.set(requestId, {
        resolve: value => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: err => {
          clearTimeout(timeout);
          reject(err);
        }
      });

      this.ws.send(packet, err => {
        if (err) {
          clearTimeout(timeout);
          this.pending.delete(requestId);
          reject(err);
        }
      });
    });
  }
}

function encode(type, payload) {
  const err = type.verify(payload);
  if (err) {
    throw new Error(err);
  }
  return type.encode(payload).finish();
}

function decode(type, buffer) {
  return type.decode(buffer);
}

async function oauth2Login(channel, proto, accessToken, versionToForce) {
  const oauth2LoginWrapper = await channel.sendRequest(
    '.lq.Lobby.oauth2Login',
    encode(proto.ReqOauth2Login, {
      type: 7,
      access_token: accessToken,
      reconnect: false,
      device: { is_browser: true },
      random_key: randomUUID(),
      client_version_string: `web-${versionToForce}`,
      gen_access_token: false,
      currency_platforms: [2]
    })
  );
  const loginResponse = decode(proto.ResOauth2Login, oauth2LoginWrapper.data);
  if (!loginResponse.account) {
    throw new Error('oauth2Login failed: account not found.');
  }
  return loginResponse;
}

async function run() {
  const uid = process.env.UID;
  const token = process.env.TOKEN;

  if (!uid || !token) {
    throw new Error('UID and TOKEN environment variables are required.');
  }

  const base = normalizeBase(process.env.MS_HOST || DEFAULT_BASE);

  const versionInfo = await fetchVersion(base);
  const versionToForce = versionInfo.version.replace('.w', '');
  console.log(`version.json -> version=${versionInfo.version} force_version=${versionInfo.force_version} code=${versionInfo.code}`);

  const codeDir = extractCodeDirectory(versionInfo.code);
  const config = await fetchConfig(base, codeDir);

  const resManifest = await fetchResVersion(base, versionInfo.version);
  const liqiPrefix = resManifest?.res?.['res/proto/liqi.json']?.prefix;
  if (!liqiPrefix) {
    throw new Error('liqi prefix missing from resversion manifest');
  }
  console.log(`liqi prefix: ${liqiPrefix}`);
  const liqiJson = await fetchLiqi(base, liqiPrefix);
  const proto = loadProtoTypes(liqiJson);

  const gatewayUrl = pickGatewayUrl(config);
  const servers = await fetchGatewayDomains(gatewayUrl);
  const server = servers[Math.floor(Math.random() * servers.length)];
  const endpoint = `wss://${server}/gateway`;
  console.log(`selected gateway endpoint: ${endpoint}`);

  const passportUrl = getPassportUrl(config);
  const accessToken = await passportLogin(passportUrl, uid, token);

  const channel = new MSRPCChannel(endpoint, base, proto.Wrapper);
  await channel.connect();

  try {
    await channel.sendRequest(
      '.lq.Lobby.heatbeat',
      encode(proto.ReqHeatBeat, { no_operation_counter: 1 })
    );

    const authWrapper = await channel.sendRequest(
      '.lq.Lobby.oauth2Auth',
      encode(proto.ReqOauth2Auth, {
        type: 7,
        code: accessToken,
        uid,
        client_version_string: `web-${versionToForce}`
      })
    );
    const authResponse = decode(proto.ResOauth2Auth, authWrapper.data);
    if (!authResponse.access_token) {
      throw new Error(`oauth2Auth failed: ${JSON.stringify(authResponse)}`);
    }

    const loginResponse = await oauth2Login(channel, proto, authResponse.access_token, versionToForce);
    const loginGold = Number(loginResponse.account.gold ?? 0);
    console.log('oauth2Login.account.gold:', loginGold);

    const payWrapper = await channel.sendRequest(
      '.lq.Lobby.payMonthTicket',
      encode(proto.ReqCommon, {})
    );
    const payResponse = decode(proto.ResPayMonthTicket, payWrapper.data);
    console.log('payMonthTicket:', JSON.stringify(payResponse));

    const infoWrapper = await channel.sendRequest(
      '.lq.Lobby.fetchMonthTicketInfo',
      encode(proto.ReqCommon, {})
    );
    const infoResponse = decode(proto.ResFetchMonthTicketInfo, infoWrapper.data);
    console.log('fetchMonthTicketInfo:', JSON.stringify(infoResponse));

    if (BUY_GREEN_GIFT) {
      const gainReviveCoinWrapper = await channel.sendRequest(
        '.lq.Lobby.gainReviveCoin',
        encode(proto.ReqCommon, {})
      );
      const gainReviveCoinResponse = decode(proto.ResCommon, gainReviveCoinWrapper.data);
      const gainReviveCoinErrorCode = Number(gainReviveCoinResponse?.error?.code ?? 0);
      if (gainReviveCoinErrorCode === 0) {
        console.log('gainReviveCoin: success');
      } else {
        console.log('gainReviveCoin: skipped', JSON.stringify(gainReviveCoinResponse));
      }
      const latestGold = loginGold + (gainReviveCoinErrorCode === 0 ? REVIVE_COIN_GOLD_BONUS : 0);
      console.log('estimatedGoldForPurchase:', latestGold);

      const shopInfoWrapper = await channel.sendRequest(
        '.lq.Lobby.fetchShopInfo',
        encode(proto.ReqCommon, {})
      );
      const shopInfoResponse = decode(proto.ResShopInfo, shopInfoWrapper.data);
      if (!shopInfoResponse.shop_info?.zhp) {
        throw new Error('fetchShopInfo failed: shop_info.zhp not found.');
      }
      const zhpGoods = shopInfoResponse.shop_info.zhp.goods ?? [];
      console.log('fetchShopInfo.shop_info.zhp.goods:', JSON.stringify(zhpGoods));

      const greenGoodsIds = zhpGoods.slice(0, 4).map(Number).filter(id => Number.isInteger(id) && id > 0);
      const maxTotalBuyable = Math.floor(latestGold / GREEN_GIFT_PRICE_GOLD);
      let remainingPurchaseCount = Math.min(
        maxTotalBuyable,
        greenGoodsIds.length * GREEN_GIFT_MAX_COUNT_PER_GOODS
      );
      let spentGold = 0;
      const purchasePlan = [];

      for (const goodsId of greenGoodsIds) {
        if (remainingPurchaseCount <= 0) {
          break;
        }

        const count = Math.min(GREEN_GIFT_MAX_COUNT_PER_GOODS, remainingPurchaseCount);
        if (count <= 0) {
          continue;
        }

        const buyWrapper = await channel.sendRequest(
          '.lq.Lobby.buyFromZHP',
          encode(proto.ReqBuyFromZHP, { goods_id: goodsId, count })
        );
        const buyResponse = decode(proto.ResCommon, buyWrapper.data);
        const errorCode = Number(buyResponse?.error?.code ?? 0);
        if (errorCode === BUY_FROM_ZHP_LIMIT_REACHED_CODE) {
          console.log(
            `buyFromZHP: skip all purchases for this run (goods_id=${goodsId}, count=${count}, purchase limit reached):`,
            JSON.stringify(buyResponse)
          );
          break;
        }
        if (errorCode !== 0) {
          throw new Error(`buyFromZHP failed for goods_id=${goodsId} count=${count}: ${JSON.stringify(buyResponse)}`);
        }

        purchasePlan.push({ goods_id: goodsId, count });
        remainingPurchaseCount -= count;
        spentGold += count * GREEN_GIFT_PRICE_GOLD;
      }

      console.log('buyFromZHP.purchasePlan:', JSON.stringify(purchasePlan));
      console.log('buyFromZHP.spentGold:', spentGold);
      console.log('buyFromZHP.remainingGoldEstimate:', Math.max(0, latestGold - spentGold));
    }
  } finally {
    await channel.close();
  }
}

run().catch(err => {
  console.error(err?.stack || err.message);
  process.exitCode = 1;
});

