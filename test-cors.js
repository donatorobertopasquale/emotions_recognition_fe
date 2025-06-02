#!/usr/bin/env node

// Simple CORS test script
const http = require('http');

console.log('Testing CORS configuration for local nginx proxy...\n');

// Test API endpoints through local nginx proxy
const tests = [
  {
    name: 'Backend Health Check',
    url: 'http://localhost:8080/api/v1/auth/health',
    method: 'GET'
  },
  {
    name: 'Classifier Health Check', 
    url: 'http://localhost:8080/api/classifier/health',
    method: 'GET'
  },
  {
    name: 'OPTIONS preflight for backend',
    url: 'http://localhost:8080/api/v1/auth/login',
    method: 'OPTIONS'
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: test.method,
      headers: {
        'Origin': 'https://emotion-recognition.gentlestone-6622e697.italynorth.azurecontainerapps.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${test.name}: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
      console.log(`   - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NOT SET'}`);
      console.log(`   - Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NOT SET'}`);
      console.log('');
      resolve();
    });

    req.on('error', (err) => {
      console.log(`❌ ${test.name}: ERROR - ${err.message}`);
      console.log('');
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏱️  ${test.name}: TIMEOUT`);
      console.log('');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('Starting CORS tests...\n');
  
  for (const test of tests) {
    await testEndpoint(test);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('✅ CORS tests completed!');
  console.log('\nIf you see "access-control-allow-origin" headers in the responses above,');
  console.log('then the CORS configuration is working correctly.');
}

runTests().catch(console.error);