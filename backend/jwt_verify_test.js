const jwt = require('jsonwebtoken');
const env = require('./src/config/env');

console.log('JWT_SECRET from env:', env.JWT_SECRET ? 'SET (' + env.JWT_SECRET.substring(0, 10) + '...)' : 'NOT SET');
console.log('JWT_EXPIRES_IN:', env.JWT_EXPIRES_IN);

// Test 1: Generate and verify with same secret
const secret1 = env.JWT_SECRET;
const payload = { id: 'user123', role: 'vendor', email: 'test@test.com' };
const token = jwt.sign(payload, secret1, { expiresIn: '1h' });
console.log('\\nTest 1 - Generate and verify with same secret:');
console.log('Token:', token.substring(0, 50) + '...');
try {
  const decoded = jwt.verify(token, secret1);
  console.log('Decoded successfully:', decoded);
} catch (e) {
  console.log('Verify FAILED:', e.message);
}

// Test 2: Verify with wrong secret
try {
  const decoded2 = jwt.verify(token, 'wrong-secret');
  console.log('\\nTest 2 - Should not reach');
} catch (e) {
  console.log('\\nTest 2 - Verify with wrong secret:', e.constructor.name, '-', e.message);
}

// Test 3: Decode without verification
const decoded3 = jwt.decode(token);
console.log('\\nTest 3 - Decode without verification:', decoded3 ? 'payload present' : 'null');

// Test 4: Check if token has expired
const payload4 = jwt.decode(token);
const now = Math.floor(Date.now() / 1000);
if (payload4 && payload4.exp) {
  console.log('\\nTest 4 - Token exp:', payload4.exp, 'current time:', now);
  console.log('Token expired:', payload4.exp * 1000 < Date.now());
}

console.log('\\nAll tests completed.');