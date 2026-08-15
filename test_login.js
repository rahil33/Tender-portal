const http = require('http');
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST'
};
const data = 'email=admin@phoenixtech.in&password=Xh34@7sfPyOtp$YnqAPE';
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(`Status: ${res.statusCode}\nResponse: ${body}`));
});
req.write(data);
req.end();