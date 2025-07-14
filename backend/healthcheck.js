const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health', // Changed from /api/health to /health
  timeout: 3000,
  method: 'GET',
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.log('❌ Health check failed');
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('❌ Health check error:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('❌ Health check timeout');
  request.destroy();
  process.exit(1);
});

request.setTimeout(3000);
request.end();