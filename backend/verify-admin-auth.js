const BASE = 'http://localhost:5050/api';

async function call(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let json = null;
  try { json = await res.json(); } catch (e) { json = {}; }
  return { status: res.status, json };
}

async function main() {
  const results = [];

  // 1. Admin valid login
  const adminLogin = await call('POST', '/auth/login', {
    email: 'admin@phoenixtech.in',
    password: 'Phoenix@Admin#2026!Secure',
  });
  const adminToken = adminLogin.json?.data?.token;
  results.push(['1. Admin login valid creds -> 200', adminLogin.status === 200]);
  results.push(['1b. Login gives admin role', adminLogin.json?.data?.user?.role === 'admin']);
  results.push(['1c. Login response does NOT leak password', !JSON.stringify(adminLogin.json).toLowerCase().includes('password')]);
  console.log('  [admin login]', adminLogin.status, 'role=', adminLogin.json?.data?.user?.role);

  // 2. Invalid password
  const wrongPass = await call('POST', '/auth/login', {
    email: 'admin@phoenixtech.in',
    password: 'WrongPassword#2026!',
  });
  results.push(['2. Invalid password -> 401', wrongPass.status === 401]);
  console.log('  [wrong pass]', wrongPass.status);

  // 3. Invalid email
  const wrongEmail = await call('POST', '/auth/login', {
    email: 'nobody@phoenixtech.in',
    password: 'Phoenix@Admin#2026!Secure',
  });
  results.push(['3. Invalid email -> 401', wrongEmail.status === 401]);
  console.log('  [wrong email]', wrongEmail.status);

  // 4. Admin API without auth
  const noToken = await call('GET', '/admin/dashboard/stats');
  results.push(['4. Admin API without auth -> 401', noToken.status === 401]);
  console.log('  [no token]', noToken.status);

  // 5. Admin API with admin token
  const adminApi = await call('GET', '/admin/dashboard/stats', null, adminToken);
  results.push(['5. Admin API with admin token -> 200', adminApi.status === 200]);
  console.log('  [admin token -> dashboard/stats]', adminApi.status, JSON.stringify(adminApi.json).slice(0, 200));

  const adminHealth = await call('GET', '/admin/health', null, adminToken);
  results.push(['5b. Admin /health with admin token -> 200', adminHealth.status === 200]);
  console.log('  [admin token -> health]', adminHealth.status);

  const adminUsers = await call('GET', '/admin/users?page=1&limit=2', null, adminToken);
  results.push(['5c. Admin /users with admin token -> 200', adminUsers.status === 200]);
  console.log('  [admin token -> users]', adminUsers.status);

  // 6. Vendor login
  const vendorLogin = await call('POST', '/auth/login', {
    email: 'verify.vendor@example.com',
    password: 'Vendor#Pass2026!',
  });
  const vendorToken = vendorLogin.json?.data?.token;
  results.push(['6. Vendor login -> 200', vendorLogin.status === 200]);
  results.push(['6b. Vendor has vendor role', vendorLogin.json?.data?.user?.role === 'vendor']);
  console.log('  [vendor login]', vendorLogin.status, 'role=', vendorLogin.json?.data?.user?.role);

  // 6c. Vendor can access its own protected route (sanity: vendor token works)
  const vendorOwn = await call('GET', '/notifications', null, vendorToken);
  results.push(['6c. Vendor token valid on protected user route (200 or 400/404, NOT 401)', vendorOwn.status !== 401]);
  console.log('  [vendor token -> /notifications]', vendorOwn.status);

  // 7. Admin API with vendor token
  const vendorAdminApi = await call('GET', '/admin/dashboard/stats', null, vendorToken);
  results.push(['7. Admin API with vendor token -> 403', vendorAdminApi.status === 403]);
  console.log('  [vendor token -> admin]', vendorAdminApi.status, JSON.stringify(vendorAdminApi.json).slice(0, 150));

  // 8. Bogus token
  const bogus = await call('GET', '/admin/dashboard/stats', null, 'invalid.token.here');
  results.push(['8. Admin API with bogus token -> 401', bogus.status === 401]);
  console.log('  [bogus token]', bogus.status);

  console.log('\n=== RESULTS ===');
  let pass = 0, fail = 0;
  for (const [name, ok] of results) {
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}`);
    if (ok) pass++; else fail++;
  }
  console.log(`\nPASS=${pass} FAIL=${fail}`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });