process.env.NODE_ENV = 'test';
process.env.PORT = '5005';

import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 5005;

interface TestResponse {
  status: number;
  data: any;
  headers: http.IncomingHttpHeaders;
}

function request(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed: any = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            // Keep raw string for csv etc.
          }
          resolve({
            status: res.statusCode || 500,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING JECRC ALUMNI DIWALI 2026 TEST SUITE');
  console.log('======================================================\n');

  let serverInstance: http.Server;
  await new Promise<void>((resolve) => {
    serverInstance = app.listen(TEST_PORT, () => {
      resolve();
    });
  });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      testsPassed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      testsFailed++;
    }
  }

  try {
    // 1. Health Check
    console.log('[Phase A: Health Check]');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'GET /api/health returns 200');
    assert(health.data.status === 'HEALTHY', 'Health status is HEALTHY');

    // 2. Authentication Tests
    console.log('\n[Phase B: Authentication & Role-Based Access]');
    const adminLogin = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'Admin@JECRC2026!',
    });
    assert(adminLogin.status === 200, 'Admin login succeeds with 200');
    assert(adminLogin.data.user.role === 'ADMIN', 'Admin role is verified');
    const adminToken = adminLogin.data.token;

    const volunteerLogin = await request('POST', '/api/auth/login', {
      username: 'volunteer1',
      password: 'Volunteer@JECRC2026!',
    });
    assert(volunteerLogin.status === 200, 'Volunteer login succeeds with 200');
    assert(volunteerLogin.data.user.role === 'VOLUNTEER', 'Volunteer role is verified');
    const volunteerToken = volunteerLogin.data.token;

    const badLogin = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'WrongPassword!',
    });
    assert(badLogin.status === 401, 'Invalid password rejected with 401');

    // 3. Public Registration Validation Tests
    console.log('\n[Phase C: Registration Validation]');
    const missingFields = await request('POST', '/api/registrations', {
      fullName: 'Rahul Sharma',
    });
    assert(missingFields.status === 400, 'Missing required fields rejected with 400');

    const invalidEmail = await request('POST', '/api/registrations', {
      fullName: 'Rahul Sharma',
      email: 'not-an-email',
      mobile: '9876543210',
      graduationYear: 2020,
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      companyName: 'Infosys',
      designation: 'Software Engineer',
    });
    assert(invalidEmail.status === 400, 'Invalid email format rejected with 400');

    const invalidMobile = await request('POST', '/api/registrations', {
      fullName: 'Rahul Sharma',
      email: 'rahul.test@example.com',
      mobile: '12345',
      graduationYear: 2020,
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      companyName: 'Infosys',
      designation: 'Software Engineer',
    });
    assert(invalidMobile.status === 400, 'Invalid mobile number rejected with 400');

    // 4. Successful Registration Flow
    console.log('\n[Phase D: Successful Registration & QR Generation]');
    const uniqueEmail = `test.alumni.${Date.now()}@jecrc.ac.in`;
    const uniqueMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    const regRes = await request('POST', '/api/registrations', {
      fullName: 'Priya Agarwal',
      email: uniqueEmail,
      mobile: uniqueMobile,
      currentCity: 'Jaipur',
      graduationYear: 2018,
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      companyName: 'Google',
      designation: 'Senior Cloud Engineer',
    });

    assert(regRes.status === 201, 'Successful registration returns 201 Created');
    assert(
      regRes.data.data.registrationId.startsWith('JECRC-DIWALI-2026-'),
      `Registration ID generated properly: ${regRes.data.data.registrationId}`
    );
    assert(
      typeof regRes.data.data.qrCodeDataUrl === 'string' &&
        regRes.data.data.qrCodeDataUrl.startsWith('data:image/png;base64,'),
      'QR Code base64 Data URL generated cleanly'
    );
    const regId = regRes.data.data.registrationId;

    // 5. Duplicate Registration Prevention
    console.log('\n[Phase E: Duplicate Registration Prevention]');
    const dupEmailRes = await request('POST', '/api/registrations', {
      fullName: 'Another Person',
      email: uniqueEmail, // Duplicate
      mobile: '9998887776',
      graduationYear: 2021,
      course: 'BCA',
      branch: 'IT',
      companyName: 'TCS',
      designation: 'Developer',
    });
    assert(dupEmailRes.status === 409, 'Duplicate email registration blocked with 409 Conflict');

    const dupMobileRes = await request('POST', '/api/registrations', {
      fullName: 'Another Person 2',
      email: `other.${Date.now()}@jecrc.ac.in`,
      mobile: uniqueMobile, // Duplicate
      graduationYear: 2021,
      course: 'BCA',
      branch: 'IT',
      companyName: 'TCS',
      designation: 'Developer',
    });
    assert(dupMobileRes.status === 409, 'Duplicate mobile registration blocked with 409 Conflict');

    // 6. Safe Public Lookup (No raw tokens exposed)
    console.log('\n[Phase F: Safe Public Lookup]');
    const lookupRes = await request('GET', `/api/registrations/${regId}`);
    assert(lookupRes.status === 200, 'Safe lookup by registration ID returns 200');
    assert(lookupRes.data.data.fullName === 'Priya Agarwal', 'Name matches in lookup');
    assert(lookupRes.data.data.qrTokenHash === undefined, 'qrTokenHash is strictly protected');

    // 7. QR Verification & Check-in Flow (Gate entry)
    console.log('\n[Phase G: Gate Entry & Duplicate Check-in Prevention]');
    // Manual Checkin by ID
    const firstCheckIn = await request(
      'POST',
      '/api/checkin/manual',
      { registrationId: regId, gateName: 'Gate 1 - North' },
      { Authorization: `Bearer ${volunteerToken}` }
    );
    assert(firstCheckIn.status === 200, 'First entry check-in succeeds with 200');
    assert(firstCheckIn.data.status === 'SUCCESS', 'Check-in status is SUCCESS');

    // Duplicate Check-in Attempt
    const secondCheckIn = await request(
      'POST',
      '/api/checkin/manual',
      { registrationId: regId, gateName: 'Gate 2 - South' },
      { Authorization: `Bearer ${volunteerToken}` }
    );
    assert(secondCheckIn.status === 200, 'Duplicate checkin returns 200 status payload');
    assert(
      secondCheckIn.data.status === 'ALREADY_CHECKED_IN',
      'Duplicate check-in correctly detected as ALREADY_CHECKED_IN'
    );

    // Invalid Token Scan
    const invalidCheckIn = await request(
      'POST',
      '/api/checkin/verify',
      { token: 'invalid-nonexistent-token', gateName: 'Gate 1' },
      { Authorization: `Bearer ${volunteerToken}` }
    );
    assert(invalidCheckIn.status === 404, 'Invalid QR code rejected with 404');
    assert(invalidCheckIn.data.status === 'INVALID', 'Status is INVALID');

    // 8. Volunteer vs Admin Permissions
    console.log('\n[Phase H: Role-Based Authorization Security]');
    // Volunteer should be blocked from Admin endpoints
    const volunteerExport = await request('GET', '/api/admin/export', undefined, {
      Authorization: `Bearer ${volunteerToken}`,
    });
    assert(
      volunteerExport.status === 403,
      'Volunteer access to Admin Export correctly blocked with 403 Forbidden'
    );

    const volunteerRegistrations = await request('GET', '/api/admin/registrations', undefined, {
      Authorization: `Bearer ${volunteerToken}`,
    });
    assert(
      volunteerRegistrations.status === 403,
      'Volunteer access to Admin Registrations correctly blocked with 403 Forbidden'
    );

    // Admin has full access
    const adminDashboard = await request('GET', '/api/admin/dashboard', undefined, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminDashboard.status === 200, 'Admin Dashboard access granted (200)');
    assert(
      adminDashboard.data.data.metrics.totalRegistered >= 1,
      'Dashboard metrics calculates real database totals'
    );

    const adminExport = await request('GET', '/api/admin/export', undefined, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminExport.status === 200, 'Admin Export CSV succeeds with 200');
    assert(
      typeof adminExport.data === 'string' && adminExport.data.includes('Registration ID'),
      'CSV contains proper header row'
    );
  } finally {
    serverInstance!.close();
  }

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
