const mongoose = require('mongoose');
const database = require('../../config/database');
const { validateAdminInput } = require('../../scripts/seedAdmin');

const { validateMongoUri, classifyMongoError, redact, CATEGORY } = database;
const GOOD = 'mongodb+srv://appuser:S3cretPass@cluster0.abc12.mongodb.net/phoenix-tender-tech?retryWrites=true&w=majority';

describe('validateMongoUri', () => {
  test('rejects missing / empty values', () => {
    expect(validateMongoUri(undefined)).toMatchObject({ ok: false });
    expect(validateMongoUri('   ').errors[0]).toMatch(/not set/);
  });

  test('accepts a proper Atlas SRV URI and never returns the password', () => {
    const r = validateMongoUri(GOOD);
    expect(r.ok).toBe(true);
    expect(r.dbName).toBe('phoenix-tender-tech');
    expect(JSON.stringify(r)).not.toMatch(/S3cretPass/);
  });

  test('accepts standard multi-host (non-SRV) URIs', () => {
    const r = validateMongoUri('mongodb://u:p@ac-1-shard-00-00.abc12.mongodb.net:27017,ac-1-shard-00-01.abc12.mongodb.net:27017/db?ssl=true');
    expect(r.ok).toBe(true);
    expect(r.hosts).toHaveLength(2);
  });

  test('flags an unescaped "@" in the password (the "_mongodb._tcp.123" failure mode)', () => {
    const r = validateMongoUri('mongodb+srv://user:pa@ss@cluster0.abc12.mongodb.net/db');
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/unescaped|URL-encode/i);
  });

  test('rejects numeric / invalid SRV hostnames', () => {
    expect(validateMongoUri('mongodb+srv://u:p@123/db').ok).toBe(false);
    expect(validateMongoUri('mongodb+srv://u:p@localhost/db').ok).toBe(false);
  });

  test('rejects placeholder hosts and credentials', () => {
    expect(validateMongoUri('mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/db').ok).toBe(false);
    expect(validateMongoUri('mongodb+srv://<username>:<password>@cluster0.abc12.mongodb.net/db').ok).toBe(false);
  });

  test('rejects quotes, wrong scheme and SRV with port', () => {
    expect(validateMongoUri(`"${GOOD}"`).ok).toBe(false);
    expect(validateMongoUri('http://cluster0.abc12.mongodb.net/db').ok).toBe(false);
    expect(validateMongoUri('mongodb+srv://u:p@cluster0.abc12.mongodb.net:27017/db').ok).toBe(false);
  });

  test('warns when the database name is missing', () => {
    const r = validateMongoUri('mongodb+srv://u:p@cluster0.abc12.mongodb.net/?retryWrites=true');
    expect(r.ok).toBe(true);
    expect(r.warnings.join(' ')).toMatch(/"test" database/);
  });
});

describe('classifyMongoError', () => {
  test('querySrv ECONNREFUSED -> dns', () => {
    const e = Object.assign(new Error('querySrv ECONNREFUSED _mongodb._tcp.cluster0.abc12.mongodb.net'), { code: 'ECONNREFUSED', syscall: 'querySrv' });
    expect(classifyMongoError(e).category).toBe(CATEGORY.DNS);
  });
  test('ENOTFOUND -> dns', () => {
    const e = Object.assign(new Error('querySrv ENOTFOUND _mongodb._tcp.123'), { code: 'ENOTFOUND', syscall: 'querySrv' });
    expect(classifyMongoError(e).category).toBe(CATEGORY.DNS);
  });
  test('bad auth -> auth', () => {
    const e = Object.assign(new Error('bad auth : authentication failed'), { name: 'MongoServerError', code: 8000 });
    expect(classifyMongoError(e).category).toBe(CATEGORY.AUTH);
  });
  test('IP allow-list server selection error -> network', () => {
    const e = Object.assign(new Error("Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted."), { name: 'MongoServerSelectionError' });
    expect(classifyMongoError(e).category).toBe(CATEGORY.NETWORK);
  });
  test('refused TCP connection (Mongoose wrapper) -> network, not unknown', () => {
    const e = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:27017'), { name: 'MongooseServerSelectionError' });
    expect(classifyMongoError(e).category).toBe(CATEGORY.NETWORK);
  });
  test('error messages are stripped of credentials', () => {
    const e = new Error('failed for mongodb+srv://bob:hunter2@cluster0.abc12.mongodb.net/db');
    const info = classifyMongoError(e);
    expect(info.message).not.toMatch(/hunter2|bob/);
    expect(redact('mongodb://u:p@h/db')).toBe('mongodb://***:***@h/db');
  });
});

describe('connect()', () => {
  afterEach(() => jest.restoreAllMocks());

  test('missing MONGO_URI fails fast with a config error and no network call', async () => {
    const spy = jest.spyOn(mongoose, 'connect');
    await expect(database.connect({ uri: '' })).rejects.toMatchObject({ category: CATEGORY.CONFIG });
    expect(spy).not.toHaveBeenCalled();
  });

  test('DNS failures are classified and retried, then surfaced', async () => {
    const dnsErr = Object.assign(new Error('querySrv ECONNREFUSED _mongodb._tcp.x'), { code: 'ECONNREFUSED', syscall: 'querySrv' });
    const spy = jest.spyOn(mongoose, 'connect').mockRejectedValue(dnsErr);
    await expect(database.connect({ uri: GOOD, retries: 2, retryDelayMs: 1 })).rejects.toMatchObject({ category: CATEGORY.DNS });
    expect(spy).toHaveBeenCalledTimes(3);
  });

  test('authentication failures are NOT retried', async () => {
    const authErr = Object.assign(new Error('bad auth : authentication failed'), { name: 'MongoServerError', code: 8000 });
    const spy = jest.spyOn(mongoose, 'connect').mockRejectedValue(authErr);
    await expect(database.connect({ uri: GOOD, retries: 2, retryDelayMs: 1 })).rejects.toMatchObject({ category: CATEGORY.AUTH });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('concurrent calls share one connection attempt', async () => {
    const spy = jest.spyOn(mongoose, 'connect').mockImplementation(() => new Promise((r) => setTimeout(r, 20)));
    await Promise.all([database.connect({ uri: GOOD, retries: 0 }), database.connect({ uri: GOOD, retries: 0 })]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('getStatus never exposes the URI', () => {
    expect(JSON.stringify(database.getStatus())).not.toMatch(/mongodb(\+srv)?:\/\//);
  });
});

describe('seedAdmin input validation', () => {
  test('rejects missing email and placeholder / weak passwords', () => {
    expect(() => validateAdminInput({ email: '', password: 'LongEnoughPass1!' })).toThrow(/ADMIN_EMAIL/);
    expect(() => validateAdminInput({ email: 'not-an-email', password: 'LongEnoughPass1!' })).toThrow(/valid email/);
    expect(() => validateAdminInput({ email: 'a@b.co', password: undefined })).toThrow(/ADMIN_PASSWORD/);
    expect(() => validateAdminInput({ email: 'a@b.co', password: 'CHANGE_ME_TO_A_STRONG_PASSWORD' })).toThrow(/placeholder/);
    expect(() => validateAdminInput({ email: 'a@b.co', password: 'CHANGE_THIS_IN_PRODUCTION' })).toThrow(/placeholder/);
    expect(() => validateAdminInput({ email: 'a@b.co', password: 'short1!' })).toThrow(/at least/);
  });
  test('accepts a real email and strong password', () => {
    expect(() => validateAdminInput({ email: 'admin@phoenixtender.in', password: 'Str0ng&Unique-Pass' })).not.toThrow();
  });
  test('error messages never contain the password', () => {
    try { validateAdminInput({ email: 'a@b.co', password: 'short1!' }); } catch (e) { expect(e.message).not.toMatch(/short1!/); }
  });
});
