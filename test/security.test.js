/**
 * Automated Security & Endpoint Test Suite
 * Tests security headers, input validation, rate limiting, and access control.
 */

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) {
      if (typeof postData === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING SECURITY & API VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? '-> ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await makeRequest('/api/health');
    assert('Health endpoint returns 200 OK', health.statusCode === 200);
    assert('Health status is ok', health.json && health.json.status === 'ok');

    // 2. Security Headers
    const headers = health.headers;
    assert('X-Content-Type-Options is nosniff', headers['x-content-type-options'] === 'nosniff');
    assert('X-Frame-Options is DENY', headers['x-frame-options'] === 'DENY');
    assert('Content-Security-Policy is present', !!headers['content-security-policy']);
    assert('CSP restricts frame-ancestors', headers['content-security-policy']?.includes("frame-ancestors 'none'"));
    assert('Referrer-Policy is strict-origin-when-cross-origin', headers['referrer-policy'] === 'strict-origin-when-cross-origin');
    assert('X-Powered-By is removed/hidden', !headers['x-powered-by']);
    assert('Permissions-Policy is present', !!headers['permissions-policy']);

    // 3. Sensitive Path Shielding (OWASP A01 / A05)
    const envTest = await makeRequest('/.env');
    assert('Access to /.env is blocked (403 Forbidden)', envTest.statusCode === 403);

    const gitTest = await makeRequest('/.git/config');
    assert('Access to /.git/config is blocked (403 Forbidden)', gitTest.statusCode === 403);

    // 4. Method restriction (OWASP A05)
    const patchTest = await makeRequest('/api/health', { method: 'PATCH' });
    assert('Disallowed HTTP method PATCH returns 405 Method Not Allowed', patchTest.statusCode === 405);

    // 5. Input Validation & Schema Integrity (OWASP A03)
    const invalidContact = await makeRequest('/api/contact', { method: 'POST' }, {
      email: 'not-an-email',
      message: 'Hello'
    });
    assert('Missing name and invalid email returns 400 Bad Request', invalidContact.statusCode === 400);

    // 6. Anti-Spam Honeypot Detection
    const honeypotTest = await makeRequest('/api/contact', { method: 'POST' }, {
      name: 'Spammer Bot',
      email: 'bot@spam.com',
      message: 'Buy cheap crypto now',
      website_hp: 'http://spam-link.ru' // Honeypot filled!
    });
    assert('Filled honeypot is silently dropped with success response', honeypotTest.statusCode === 200 && honeypotTest.json?.success === true);

    // 7. Security.txt RFC 9116 verification
    const secTxt = await makeRequest('/.well-known/security.txt');
    assert('security.txt is accessible', secTxt.statusCode === 200 && secTxt.body.includes('Contact:'));

    // 8. Robots.txt verification
    const robots = await makeRequest('/robots.txt');
    assert('robots.txt is accessible', robots.statusCode === 200 && robots.body.includes('Disallow: /api/'));

    console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
}

runTests();
