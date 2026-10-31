/**
 * Centralized MongoDB connection management.
 *
 * Every entry point (server, seed scripts, reports, diagnostics) must connect
 * through this module so that there is exactly one place that:
 *   - loads environment variables (dotenv, never overriding real env vars),
 *   - validates MONGO_URI,
 *   - configures timeouts / pool options,
 *   - classifies failures (DNS vs auth vs network vs TLS vs bad URI),
 *   - never prints credentials.
 *
 * In production (Render) variables come from the platform environment; a local
 * .env file is optional and is never required.
 */
const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load backend/.env if it exists. dotenv does not override variables that are
// already set, so Render / CI environment variables always win.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

// ─── Logging (lazy so this module stays usable from tiny scripts) ─────────────
const log = (level, message, meta) => {
  try {
    // eslint-disable-next-line global-require
    const logger = require('./logger');
    logger[level](message, meta);
  } catch (_) {
    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : 'log'](`[${level}] ${message}`);
  }
};

// ─── Redaction ────────────────────────────────────────────────────────────────
/** Replace credentials in any mongodb URI found inside a string. */
const redact = (text) =>
  String(text == null ? '' : text).replace(
    /(mongodb(?:\+srv)?:\/\/)([^@\s/]*@)?/gi,
    (_m, scheme, creds) => `${scheme}${creds ? '***:***@' : ''}`
  );

// ─── URI validation ───────────────────────────────────────────────────────────
const PLACEHOLDER_HOST_RE = /(^|\.)example\.(com|org|net)$|^host(name)?$|^cluster0\.example\./i;
const HOST_LABEL_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/i;

const isValidHostname = (host) => {
  if (!host || host.length > 253) return false;
  const labels = host.split('.');
  if (!labels.every((l) => HOST_LABEL_RE.test(l))) return false;
  // A TLD / last label can never be purely numeric (rejects "123", "1.2.3").
  return !/^\d+$/.test(labels[labels.length - 1]);
};

/**
 * Validate a MongoDB connection string WITHOUT connecting.
 * Never includes the password in its output.
 *
 * @param {string|undefined} uri
 * @returns {{ok: boolean, errors: string[], warnings: string[], scheme?: string,
 *            hosts?: string[], dbName?: string, hasCredentials?: boolean}}
 */
const validateMongoUri = (uri) => {
  const errors = [];
  const warnings = [];

  if (uri === undefined || uri === null || String(uri).trim() === '') {
    return { ok: false, errors: ['MONGO_URI is not set.'], warnings };
  }
  const value = String(uri).trim();

  if (/^["']|["']$/.test(value)) {
    errors.push('MONGO_URI is wrapped in quotes. Remove the surrounding quotes.');
  }
  if (/\s/.test(value)) {
    errors.push('MONGO_URI contains whitespace or a line break.');
  }
  if (/[<>]/.test(value)) {
    errors.push('MONGO_URI still contains a <placeholder>. Replace <username>/<password> with real values.');
  }

  const m = value.match(/^(mongodb(?:\+srv)?):\/\/(.*)$/i);
  if (!m) {
    errors.push('MONGO_URI must start with "mongodb://" or "mongodb+srv://".');
    return { ok: false, errors, warnings };
  }
  const scheme = m[1].toLowerCase();
  const rest = m[2];

  // authority = everything up to the first "/" or "?" that follows the LAST "@".
  const pathStart = rest.search(/[/?]/);
  const authority = pathStart === -1 ? rest : rest.slice(0, pathStart);
  const tail = pathStart === -1 ? '' : rest.slice(pathStart);

  const atCount = (authority.match(/@/g) || []).length;
  if (atCount > 1) {
    errors.push(
      'MONGO_URI has more than one "@" before the path. The password contains an unescaped special ' +
        'character ("@", ":", "/", "?", "#", "%"). URL-encode it (e.g. "@" -> %40) or set an ' +
        'alphanumeric password in Atlas. (This produces errors like "querySrv ENOTFOUND _mongodb._tcp.123".)'
    );
  }

  const at = authority.lastIndexOf('@');
  const userInfo = at === -1 ? '' : authority.slice(0, at);
  const hostPart = at === -1 ? authority : authority.slice(at + 1);
  const hasCredentials = userInfo.length > 0;

  if (hasCredentials) {
    const colon = userInfo.indexOf(':');
    const user = colon === -1 ? userInfo : userInfo.slice(0, colon);
    const pass = colon === -1 ? '' : userInfo.slice(colon + 1);
    if (!user) errors.push('MONGO_URI has an empty username.');
    if (colon === -1 || !pass) errors.push('MONGO_URI has no password.');
    if (/CHANGE_?ME|YOUR_?PASSWORD|^PASSWORD$|^USERNAME$/i.test(user) || /CHANGE_?ME|YOUR_?PASSWORD|^PASSWORD$/i.test(pass)) {
      errors.push('MONGO_URI still contains placeholder credentials (USERNAME / PASSWORD).');
    }
    if (/%(?![0-9a-f]{2})/i.test(userInfo)) {
      errors.push('MONGO_URI credentials contain a "%" that is not a valid URL-encoding.');
    }
  } else if (scheme === 'mongodb+srv') {
    warnings.push('MONGO_URI has no credentials; Atlas requires a database user.');
  }

  const hosts = hostPart.split(',').filter(Boolean);
  if (hosts.length === 0) {
    errors.push('MONGO_URI has no host.');
  }
  if (scheme === 'mongodb+srv') {
    if (hosts.length !== 1) errors.push('mongodb+srv:// URIs must contain exactly one host.');
    if (hosts[0] && /:\d+$/.test(hosts[0])) errors.push('mongodb+srv:// URIs must not specify a port.');
    const h = (hosts[0] || '').toLowerCase();
    if (h && (h.split('.').length < 3 || !isValidHostname(h))) {
      errors.push(
        `"${h}" is not a valid SRV hostname (expected something like cluster0.abcde.mongodb.net).`
      );
    }
  } else {
    hosts.forEach((h) => {
      const hostname = h.replace(/:\d+$/, '');
      if (!isValidHostname(hostname) && !/^\[[0-9a-f:]+\]$/i.test(hostname) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        errors.push(`"${hostname}" is not a valid MongoDB host.`);
      }
    });
  }
  hosts.forEach((h) => {
    if (PLACEHOLDER_HOST_RE.test(h.replace(/:\d+$/, ''))) {
      errors.push(`Host "${h}" looks like a placeholder, not a real cluster.`);
    }
  });

  const dbMatch = tail.match(/^\/([^?]*)/);
  const dbName = dbMatch && dbMatch[1] ? decodeURIComponent(dbMatch[1]) : '';
  if (!dbName) {
    warnings.push(
      'MONGO_URI has no database name, so MongoDB will use the default "test" database. ' +
        'Add it after the host (…mongodb.net/phoenix-tender-tech?…) or set MONGO_DB_NAME.'
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    scheme,
    hosts: hosts.map((h) => h.toLowerCase()),
    dbName,
    hasCredentials,
  };
};

// ─── Error classification ─────────────────────────────────────────────────────
const CATEGORY = Object.freeze({
  CONFIG: 'config', // missing / invalid URI
  DNS: 'dns', // SRV/hostname resolution failed
  AUTH: 'auth', // wrong user/password/authSource
  NETWORK: 'network', // TCP blocked, IP not allow-listed, timeouts
  TLS: 'tls',
  UNKNOWN: 'unknown',
});

const HINTS = {
  [CATEGORY.CONFIG]:
    'Fix MONGO_URI (see the listed problems). On Render set it under Environment; locally put it in backend/.env.',
  [CATEGORY.DNS]:
    'Node could not resolve the Atlas SRV record. Run "npm run db:diagnose". If nslookup works but Node fails, ' +
    'the DNS server your machine uses refuses SRV/TCP queries from Node. Fix the OS/router DNS, set ' +
    'MONGO_DNS_SERVERS for local development only, or use the Atlas non-SRV "standard connection string". ' +
    'On Render do not override DNS.',
  [CATEGORY.AUTH]:
    'Atlas rejected the credentials. Check the database user name/password (URL-encode special characters), ' +
    'the user\'s privileges, and "authSource" (Atlas users normally use authSource=admin, which is the default).',
  [CATEGORY.NETWORK]:
    'DNS worked but no server could be reached. In Atlas > Network Access allow this machine\'s IP ' +
    '(for Render add its outbound IPs, or temporarily 0.0.0.0/0 while testing), and check firewalls/VPN and that the cluster is not paused.',
  [CATEGORY.TLS]:
    'TLS handshake failed. This is most often an Atlas IP allow-list problem; otherwise check system date/time and any TLS-intercepting proxy/antivirus. Do not disable TLS.',
  [CATEGORY.UNKNOWN]: 'See the error message above.',
};

/**
 * Turn any connection error into { category, code, message, hint } with
 * credentials stripped from the message.
 */
const classifyMongoError = (err) => {
  const e = err || {};
  const code = e.code || e.cause?.code || e.reason?.code;
  const syscall = e.syscall || e.cause?.syscall;
  const name = e.name || '';
  const msg = String(e.message || e);
  const lower = msg.toLowerCase();

  let category = CATEGORY.UNKNOWN;

  if (e.category === CATEGORY.CONFIG || name === 'MongoParseError' || name === 'MongoAPIError' || /invalid (scheme|connection string)|must contain exactly one host/.test(lower)) {
    category = CATEGORY.CONFIG;
  } else if (
    syscall === 'querySrv' || syscall === 'queryTxt' || syscall === 'getaddrinfo' ||
    ['ENOTFOUND', 'ESERVFAIL', 'ENODATA', 'EAI_AGAIN', 'EREFUSED'].includes(code) ||
    (code === 'ECONNREFUSED' && /query(srv|txt)/i.test(`${syscall} ${msg}`)) ||
    /querysrv|querytxt/.test(lower)
  ) {
    category = CATEGORY.DNS;
  } else if (
    name === 'MongoServerError' && (e.code === 18 || e.code === 13 || e.codeName === 'AuthenticationFailed') ||
    /bad auth|authentication failed|auth failed|not authorized/.test(lower)
  ) {
    category = CATEGORY.AUTH;
  } else if (/ssl|tls|certificate|alert internal error|handshake/.test(lower) && !/whitelist|allow.?list/.test(lower)) {
    category = CATEGORY.TLS;
  } else if (
    /ServerSelectionError$/.test(name) || name === 'MongoNetworkError' || name === 'MongoNetworkTimeoutError' ||
    ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH'].includes(code) ||
    /whitelist|allow.?list|server selection|timed out|timeout/.test(lower)
  ) {
    category = CATEGORY.NETWORK;
  }

  return { category, code: code || e.codeName, message: redact(msg), hint: HINTS[category] };
};

class MongoConnectionError extends Error {
  constructor(info, problems) {
    super(info.message);
    this.name = 'MongoConnectionError';
    this.category = info.category;
    this.code = info.code;
    this.hint = info.hint;
    this.problems = problems || [];
  }
}

// ─── Optional DNS tuning (opt-in only) ────────────────────────────────────────
let dnsConfigured = false;
/**
 * Apply DNS tuning ONLY when explicitly requested through the environment.
 *   MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8   -> dns.setServers (local dev workaround)
 *   MONGO_DNS_RESULT_ORDER=ipv4first    -> dns.setDefaultResultOrder
 * By default Node uses the platform's resolver, which is what Render expects.
 */
const configureDns = (env = process.env) => {
  if (dnsConfigured) return;
  dnsConfigured = true;

  const servers = (env.MONGO_DNS_SERVERS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (servers.length) {
    try {
      dns.setServers(servers);
      log('warn', 'Custom DNS servers applied for MongoDB lookups (MONGO_DNS_SERVERS)', { servers });
    } catch (err) {
      log('error', `Ignoring invalid MONGO_DNS_SERVERS: ${err.message}`);
    }
  }
  const order = (env.MONGO_DNS_RESULT_ORDER || '').trim();
  if (order) {
    if (['ipv4first', 'verbatim'].includes(order)) {
      dns.setDefaultResultOrder(order);
      log('info', `DNS result order set to ${order} (MONGO_DNS_RESULT_ORDER)`);
    } else {
      log('error', 'Ignoring MONGO_DNS_RESULT_ORDER: must be "ipv4first" or "verbatim"');
    }
  }
};

// ─── Connection state ─────────────────────────────────────────────────────────
const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];
let connectPromise = null;
let listenersAttached = false;
let lastError = null; // { category, code, at }
let connectedAt = null;

const intFromEnv = (name, fallback, env = process.env) => {
  const n = parseInt(env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const retriesFromEnv = (fallback, env = process.env) => {
  const n = parseInt(env.MONGO_CONNECT_RETRIES, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const buildOptions = (env = process.env) => {
  const options = {
    serverSelectionTimeoutMS: intFromEnv('MONGO_SERVER_SELECTION_TIMEOUT_MS', 10000, env),
    connectTimeoutMS: intFromEnv('MONGO_CONNECT_TIMEOUT_MS', 10000, env),
    socketTimeoutMS: intFromEnv('MONGO_SOCKET_TIMEOUT_MS', 45000, env),
    maxPoolSize: intFromEnv('MONGO_MAX_POOL_SIZE', 10, env),
    minPoolSize: intFromEnv('MONGO_MIN_POOL_SIZE', 1, env),
    heartbeatFrequencyMS: 10000,
  };
  if (env.MONGO_DB_NAME && env.MONGO_DB_NAME.trim()) options.dbName = env.MONGO_DB_NAME.trim();
  return options;
};

const attachListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;
  const c = mongoose.connection;
  c.on('connected', () => { connectedAt = new Date(); log('info', 'MongoDB connected', { db: c.name }); });
  c.on('disconnected', () => log('warn', 'MongoDB disconnected'));
  c.on('reconnected', () => log('info', 'MongoDB reconnected'));
  c.on('error', (err) => {
    const info = classifyMongoError(err);
    lastError = { category: info.category, code: info.code, at: new Date() };
    log('error', `MongoDB error [${info.category}]: ${info.message}`);
  });
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRYABLE = new Set([CATEGORY.DNS, CATEGORY.NETWORK, CATEGORY.TLS, CATEGORY.UNKNOWN]);

/**
 * Connect once. Concurrent / repeated calls share the same connection.
 * Throws MongoConnectionError (with .category and .hint) on failure; it never
 * calls process.exit, callers decide what to do.
 *
 * @param {object} [opts]
 * @param {string} [opts.uri]       Override process.env.MONGO_URI (tests).
 * @param {number} [opts.retries]   Extra attempts for transient failures (default MONGO_CONNECT_RETRIES or 2).
 * @param {number} [opts.retryDelayMs]
 */
const connect = (opts = {}) => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const uri = opts.uri !== undefined ? opts.uri : process.env.MONGO_URI;
    const check = validateMongoUri(uri);
    check.warnings.forEach((w) => log('warn', w));
    if (!check.ok) {
      throw new MongoConnectionError(
        { category: CATEGORY.CONFIG, message: `Invalid MongoDB configuration: ${check.errors[0]}`, hint: HINTS[CATEGORY.CONFIG] },
        check.errors
      );
    }

    configureDns();
    attachListeners();

    const retries = opts.retries !== undefined ? opts.retries : retriesFromEnv(2);
    const baseDelay = opts.retryDelayMs !== undefined ? opts.retryDelayMs : 2000;
    const options = buildOptions();

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        log('info', `Connecting to MongoDB (${check.scheme}, attempt ${attempt + 1}/${retries + 1})`, {
          host: check.hosts[0], db: options.dbName || check.dbName || '(default)',
        });
        await mongoose.connect(String(uri).trim(), options);
        lastError = null;
        return mongoose.connection;
      } catch (err) {
        const info = classifyMongoError(err);
        lastError = { category: info.category, code: info.code, at: new Date() };
        log('error', `MongoDB connection attempt ${attempt + 1} failed [${info.category}${info.code ? `/${info.code}` : ''}]: ${info.message}`);
        try { await mongoose.disconnect(); } catch (_) { /* ignore */ }
        if (attempt >= retries || !RETRYABLE.has(info.category)) {
          throw new MongoConnectionError(info);
        }
        await sleep(baseDelay * (attempt + 1));
      }
    }
    return mongoose.connection; // unreachable
  })().finally(() => { connectPromise = null; });

  return connectPromise;
};

/** Close the connection (safe to call repeatedly). */
const disconnect = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  log('info', 'MongoDB connection closed');
};

/** Cheap liveness probe. */
const ping = async () => {
  if (mongoose.connection.readyState !== 1) throw new Error('MongoDB is not connected');
  const t = Date.now();
  await mongoose.connection.db.admin().ping();
  return Date.now() - t;
};

/** Safe-to-expose status (no URI, no credentials, no hostnames). */
const getStatus = () => ({
  state: STATES[mongoose.connection.readyState] || 'unknown',
  database: mongoose.connection.readyState === 1 ? mongoose.connection.name : undefined,
  connectedSince: connectedAt ? connectedAt.toISOString() : undefined,
  lastError: lastError
    ? { category: lastError.category, code: lastError.code, at: lastError.at.toISOString(), hint: HINTS[lastError.category] }
    : null,
});

module.exports = {
  connect,
  disconnect,
  ping,
  getStatus,
  validateMongoUri,
  classifyMongoError,
  MongoConnectionError,
  CATEGORY,
  redact,
  configureDns,
  buildOptions,
};
