/**
 * MongoDB / Atlas connectivity diagnostics.  Run:  npm run db:diagnose
 *
 * Reads MONGO_URI from the environment (or backend/.env) and prints a step by
 * step report that separates the different failure classes:
 *   1. URI problems         2. DNS (SRV/TXT/A) problems
 *   3. TCP/network problems 4. Authentication problems
 * Credentials are never printed. Nothing here changes how the app connects.
 */
const dns = require('dns');
const net = require('net');
const database = require('../config/database');

const { Resolver } = dns.promises;
const mark = (ok) => (ok ? 'PASS' : 'FAIL');
const line = (s = '') => console.log(s);

const tryResolve = async (label, fn) => {
  try {
    const r = await fn();
    line(`  [PASS] ${label}: ${JSON.stringify(r).slice(0, 220)}`);
    return { ok: true, value: r };
  } catch (e) {
    line(`  [FAIL] ${label}: ${e.code || e.name} (${e.syscall || 'dns'}) ${database.redact(e.message)}`);
    return { ok: false, error: e };
  }
};

const tcpProbe = (host, port, timeoutMs = 6000) =>
  new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok, why) => { socket.destroy(); resolve({ ok, why }); };
    socket.setTimeout(timeoutMs, () => done(false, 'timeout'));
    socket.once('connect', () => done(true));
    socket.once('error', (e) => done(false, e.code || e.message));
  });

(async () => {
  let failed = false;
  line('=== MongoDB connectivity diagnostics ===');
  line(`Node ${process.version} on ${process.platform}/${process.arch}`);
  line(`DNS servers used by Node (c-ares): ${JSON.stringify(dns.getServers())}`);
  line(`Default DNS result order: ${dns.getDefaultResultOrder()}`);
  if (process.env.MONGO_DNS_SERVERS) line(`MONGO_DNS_SERVERS override requested: ${process.env.MONGO_DNS_SERVERS}`);
  line();

  line('1) MONGO_URI');
  const check = database.validateMongoUri(process.env.MONGO_URI);
  check.errors.forEach((e) => line(`  [FAIL] ${e}`));
  check.warnings.forEach((w) => line(`  [WARN] ${w}`));
  if (!check.ok) {
    line('\nFix MONGO_URI first; no further checks are meaningful.');
    process.exit(1);
  }
  line(`  [PASS] scheme=${check.scheme} host=${check.hosts.join(',')} db=${check.dbName || '(none -> "test")'} credentials=${check.hasCredentials ? 'present' : 'absent'}`);
  line();

  database.configureDns();
  let targets = [];
  const host = check.hosts[0].replace(/:\d+$/, '');

  line('2) DNS');
  if (check.scheme === 'mongodb+srv') {
    const srvName = `_mongodb._tcp.${host}`;
    const viaNode = await tryResolve(`Node resolveSrv(${srvName}) [c-ares, current servers]`, () => dns.promises.resolveSrv(srvName));
    await tryResolve(`Node resolveTxt(${host})`, () => dns.promises.resolveTxt(host));
    const viaOs = await tryResolve(`OS resolver lookup(${host}) [getaddrinfo - same path as ping/nslookup-ish]`, () => dns.promises.lookup(host, { all: true }).catch((e) => { throw e; }));
    if (!viaNode.ok) {
      failed = true;
      line('  -> Per-server SRV test (finds which of YOUR resolvers refuses SRV queries):');
      for (const server of dns.getServers()) {
        const r = new Resolver(); r.setServers([server]);
        await tryResolve(`   via ${server}`, () => r.resolveSrv(srvName));
      }
      line('  -> Public resolvers (diagnostic only; the app does NOT use these unless MONGO_DNS_SERVERS is set):');
      for (const server of ['1.1.1.1', '8.8.8.8']) {
        const r = new Resolver(); r.setServers([server]);
        await tryResolve(`   via ${server}`, () => r.resolveSrv(srvName));
      }
      line('  Interpretation: if public resolvers PASS and your own resolver FAILS (ECONNREFUSED/ESERVFAIL/ENOTFOUND), the');
      line('  resolver Node picked up from your OS/router/VPN does not answer SRV queries from c-ares (nslookup uses the OS');
      line('  DNS client, which can succeed via a different path). Change the adapter DNS, disable the VPN/filter, or use');
      line('  MONGO_DNS_SERVERS locally, or the Atlas non-SRV standard connection string.');
    } else {
      targets = viaNode.value.map((r) => ({ host: r.name, port: r.port }));
    }
    if (viaOs.ok && !viaNode.ok) line('  Note: OS lookup works but Node SRV does not -> classic c-ares vs OS resolver discrepancy.');
  } else {
    for (const h of check.hosts) {
      const [name, port] = h.split(':');
      const r = await tryResolve(`lookup(${name})`, () => dns.promises.lookup(name, { all: true }));
      if (!r.ok) failed = true;
      targets.push({ host: name, port: Number(port) || 27017 });
    }
  }
  line();

  line('3) TCP reachability (port 27017)');
  if (!targets.length) line('  skipped (no hosts resolved)');
  let reachable = 0;
  for (const t of targets) {
    const r = await tcpProbe(t.host, t.port);
    if (r.ok) reachable += 1;
    line(`  [${mark(r.ok)}] ${t.host}:${t.port}${r.ok ? '' : ` (${r.why})`}`);
  }
  if (targets.length && reachable === 0) {
    failed = true;
    line('  -> No Atlas node reachable: check Atlas > Network Access (IP allow-list), firewall, VPN, paused cluster.');
  }
  line();

  line('4) Authentication / ping (real connection, no retries)');
  try {
    await database.connect({ retries: 0 });
    const ms = await database.ping();
    line(`  [PASS] connected to database "${database.getStatus().database}", ping ${ms}ms`);
  } catch (e) {
    failed = true;
    line(`  [FAIL] ${e.category || 'unknown'}: ${e.message}`);
    if (e.hint) line(`  Hint: ${e.hint}`);
  } finally {
    await database.disconnect().catch(() => {});
  }

  line(`\nResult: ${failed ? 'PROBLEMS FOUND' : 'ALL CHECKS PASSED'}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('Diagnostics crashed:', database.redact(e.message)); process.exit(2); });
