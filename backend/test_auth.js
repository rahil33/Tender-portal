const request = require('supertest');
const app = require('./server');

async function testLogin() {
  try {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test.admin@phoenixtech.in', password: 'Xh34@7sfPyOtp$YnqAPE' });
    
    console.log('Login Status:', res.statusCode);
    console.log('Login Body:', JSON.stringify(res.body, null, 2));
    
    if (res.statusCode === 200 && res.body.success && res.body.data.token) {
      console.log('\n✓ Login PASS');
    } else {
      console.log('\n✗ Login FAIL');
    }
  } catch (err) {
    console.error('Login error:', err.message);
  }
}

testLogin();