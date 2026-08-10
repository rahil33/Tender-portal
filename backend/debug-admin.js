require('dotenv').config();
const BASE = 'http://localhost:5050/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@phoenixtech.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD is not set in the environment.');
  process.exit(1);
}
async function call(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let json = null;
  try { json = await res.json(); } catch (e) { json = {}; }
  return { status: res.status, json };
}
async function main() {
  const login = await call('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const adminToken = login.json?.data?.token;
  console.log('login', login.status);
  for (const p of ['/admin/dashboard/stats', '/admin/health', '/admin/statistics', '/admin/users?page=1&limit=2', '/admin/analytics', '/admin/settings']) {
    const r = await call('GET', p, null, adminToken);
    console.log(`${r.status} ${p}:`, JSON.stringify(r.json).slice(0, 300));
  }
  const vendorLogin = await call('POST', '/auth/login', { email: 'verify.vendor@example.com', password: 'Vendor#Pass2026!' });
  const vendorToken = vendorLogin.json?.data?.token;
  const v = await call('GET', '/admin/dashboard/stats', null, vendorToken);
  console.log('vendor->stats', v.status, JSON.stringify(v.json).slice(0, 300));
}
main().catch((e) => { console.error(e); process.exit(1); });