const jwt = require('jsonwebtoken');

// Test 1: Generate and verify with same secret
const secret1 = '727c36b86711c7921d986ca365ab1ffd81c783eb5c18e40023720fa91cd642ed';
const payload = { id: 'user123', role: 'vendor', email: 'test@test.com' };
const token = jwt.sign(payload, secret1, { expiresIn: '1h' });
console.log('Token:', token);
const decoded = jwt.verify(token, secret1);
console.log('Decoded Test 1:', decoded);

// Test 2: Verify with DIFFERENT secret (this should fail)
try {
  const decoded2 = jwt.verify(token, 'different-secret-wrong');
  console.log('Decoded Test 2 (should not reach):', decoded2);
} catch (e) {
  console.log('Test 2 - Verify with wrong secret FAILS as expected:', e.message);
}

// Test 3: Check what happens when token has wrong secret
try {
  const badToken = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
  const decoded3 = jwt.verify(badToken, secret1);
  console.log('Decoded Test 3 (should not reach):', decoded3);
} catch (e) {
  console.log('Test 3 - Wrong secret during verify:', e.constructor.name, '-', e.message);
}

// Test 4: Decode without verification
const decoded4 = jwt.decode(token);
console.log('Decoded Test 4 (no verification):', decoded4);

console.log('\nAll tests completed.');