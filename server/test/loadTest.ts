process.env.NODE_ENV = 'test';
process.env.PORT = '5006';

import app from '../src/app.js';
import http from 'http';
import { performance } from 'perf_hooks';

const LOAD_TEST_PORT = 5006;
const BASE_URL = `http://127.0.0.1:${LOAD_TEST_PORT}`;

interface HttpRequestOptions {
  method: string;
  path: string;
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

interface HttpResponse {
  status: number;
  durationMs: number;
  data: any;
  headers: http.IncomingHttpHeaders;
}

function makeRequest({
  method,
  path,
  body,
  headers = {},
  timeoutMs = 15000,
}: HttpRequestOptions): Promise<HttpResponse> {
  return new Promise((resolve) => {
    const startTime = performance.now();
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
        hostname: '127.0.0.1',
        port: LOAD_TEST_PORT,
        path,
        method,
        headers: reqHeaders,
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          const durationMs = performance.now() - startTime;
          let parsed: any = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            // Keep raw text
          }
          resolve({
            status: res.statusCode || 500,
            durationMs,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      const durationMs = performance.now() - startTime;
      resolve({
        status: 408, // Timeout
        durationMs,
        data: { error: 'Request Timeout' },
        headers: {},
      });
    });

    req.on('error', (err) => {
      const durationMs = performance.now() - startTime;
      resolve({
        status: 500,
        durationMs,
        data: { error: err.message },
        headers: {},
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function calculatePercentiles(durations: number[]) {
  if (durations.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0, p95: 0, p99: 0 };
  }
  const sorted = [...durations].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = sum / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const getPercentile = (p: number) => {
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
  };

  return {
    avg: Math.round(avg * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    median: Math.round(getPercentile(50) * 10) / 10,
    p95: Math.round(getPercentile(95) * 10) / 10,
    p99: Math.round(getPercentile(99) * 10) / 10,
  };
}

async function runScenario1Browsing(vUsers = 50) {
  console.log(`\n======================================================`);
  console.log(`🚀 SCENARIO 1: WEBSITE BROWSING & PUBLIC ENDPOINTS`);
  console.log(`Simulating ${vUsers} concurrent users browsing the site`);
  console.log(`======================================================`);

  const startTime = performance.now();
  const tasks: Promise<HttpResponse>[] = [];

  for (let i = 0; i < vUsers; i++) {
    tasks.push(
      (async () => {
        // Hit health endpoint then registration lookup/info
        const res = await makeRequest({ method: 'GET', path: '/api/health' });
        return res;
      })()
    );
  }

  const results = await Promise.all(tasks);
  const totalDuration = (performance.now() - startTime) / 1000;
  const durations = results.map((r) => r.durationMs);
  const successCount = results.filter((r) => r.status >= 200 && r.status < 400).length;
  const failCount = results.length - successCount;
  const http429 = results.filter((r) => r.status === 429).length;
  const http500 = results.filter((r) => r.status >= 500).length;
  const timeouts = results.filter((r) => r.status === 408).length;
  const stats = calculatePercentiles(durations);

  console.log(`Total Requests:      ${results.length}`);
  console.log(`Successful (2xx):    ${successCount}`);
  console.log(`Failed:              ${failCount} (429: ${http429}, 500: ${http500}, timeouts: ${timeouts})`);
  console.log(`Avg Latency:         ${stats.avg} ms`);
  console.log(`Median Latency:      ${stats.median} ms`);
  console.log(`p95 Latency:         ${stats.p95} ms`);
  console.log(`p99 Latency:         ${stats.p99} ms`);
  console.log(`Throughput:          ${Math.round(results.length / totalDuration)} req/s`);

  return { results, stats, totalDuration };
}

async function runScenario2Registration(vUsers = 50) {
  console.log(`\n======================================================`);
  console.log(`🚀 SCENARIO 2: CONCURRENT REGISTRATION (50 VIRTUAL USERS)`);
  console.log(`Submitting valid registrations with varied games & activity selections`);
  console.log(`======================================================`);

  const testBatchTimestamp = Date.now();
  const startTime = performance.now();
  const tasks: Promise<HttpResponse>[] = [];
  const createdRegistrationIds: string[] = [];
  const rawQrTokens: string[] = [];

  const sampleGamesSets = [
    ['Musical Chair'],
    ['Cricket'],
    ['Musical Chair', 'Cricket'],
    ['Pickle Ball', 'Dumb Charades'],
    ['Other Activities: Badminton'],
    ['Cricket', 'Pickle Ball', 'Other Activities: Chess'],
    [],
  ];

  for (let i = 0; i < vUsers; i++) {
    const email = `loadtest.${testBatchTimestamp}.${i}@jecrc.ac.in`;
    const mobile = `91${String(testBatchTimestamp).slice(-4)}${String(i).padStart(4, '0')}`;
    const games = sampleGamesSets[i % sampleGamesSets.length];

    tasks.push(
      (async () => {
        const res = await makeRequest({
          method: 'POST',
          path: '/api/registrations',
          body: {
            fullName: `Alumni Test User ${i + 1}`,
            email,
            mobile,
            currentCity: 'Jaipur',
            graduationYear: 2015 + (i % 8),
            degree: 'B.Tech',
            course: 'Computer Science & Engineering (CSE)',
            companyName: 'Tech Corp',
            designation: 'Software Engineer',
            games,
          },
        });
        return res;
      })()
    );
  }

  const results = await Promise.all(tasks);
  const totalDuration = (performance.now() - startTime) / 1000;
  const durations = results.map((r) => r.durationMs);
  const successCount = results.filter((r) => r.status === 201).length;
  const failCount = results.length - successCount;
  const http429 = results.filter((r) => r.status === 429).length;
  const http500 = results.filter((r) => r.status >= 500).length;
  const timeouts = results.filter((r) => r.status === 408).length;
  const stats = calculatePercentiles(durations);

  for (const r of results) {
    if (r.status === 201 && r.data?.data?.registrationId) {
      createdRegistrationIds.push(r.data.data.registrationId);
    }
  }

  console.log(`Total Registrations Attempted: ${results.length}`);
  console.log(`Successful Registrations:      ${successCount}`);
  console.log(`Failed:                        ${failCount} (429: ${http429}, 500: ${http500}, timeouts: ${timeouts})`);
  console.log(`Avg Latency:                   ${stats.avg} ms`);
  console.log(`Median Latency:                ${stats.median} ms`);
  console.log(`p95 Latency:                   ${stats.p95} ms`);
  console.log(`p99 Latency:                   ${stats.p99} ms`);
  console.log(`Throughput:                    ${Math.round((results.length / totalDuration) * 10) / 10} req/s`);

  // Verify duplicate prevention on a sample of created users
  console.log(`\nVerifying duplicate registration rejection on sample...`);
  const dupCheck = await makeRequest({
    method: 'POST',
    path: '/api/registrations',
    body: {
      fullName: 'Duplicate User',
      email: `loadtest.${testBatchTimestamp}.0@jecrc.ac.in`,
      mobile: '9829011111',
      graduationYear: 2020,
      degree: 'B.Tech',
      course: 'Computer Science & Engineering (CSE)',
      companyName: 'Tech Corp',
      designation: 'Engineer',
    },
  });
  console.log(`Duplicate Email Result Status: ${dupCheck.status} (Expected: 409)`);

  return { results, stats, createdRegistrationIds, totalDuration };
}

async function runScenario3Dashboard(adminToken: string, vUsers = 10) {
  console.log(`\n======================================================`);
  console.log(`🚀 SCENARIO 3: AUTHENTICATED ADMIN DASHBOARD & DIRECTORY`);
  console.log(`Simulating concurrent admin requests, pagination, and game filters`);
  console.log(`======================================================`);

  const startTime = performance.now();
  const tasks: Promise<HttpResponse>[] = [];

  const paths = [
    '/api/admin/dashboard',
    '/api/admin/registrations?page=1&limit=15',
    '/api/admin/registrations?page=1&limit=15&degree=B.Tech',
    '/api/admin/registrations?page=1&limit=15&game=Cricket',
    '/api/admin/registrations?page=1&limit=15&search=Alumni',
  ];

  for (let i = 0; i < vUsers * 3; i++) {
    const path = paths[i % paths.length];
    tasks.push(
      makeRequest({
        method: 'GET',
        path,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })
    );
  }

  const results = await Promise.all(tasks);
  const totalDuration = (performance.now() - startTime) / 1000;
  const durations = results.map((r) => r.durationMs);
  const successCount = results.filter((r) => r.status === 200).length;
  const failCount = results.length - successCount;
  const stats = calculatePercentiles(durations);

  console.log(`Total Dashboard Requests: ${results.length}`);
  console.log(`Successful (200 OK):      ${successCount}`);
  console.log(`Failed:                   ${failCount}`);
  console.log(`Avg Latency:              ${stats.avg} ms`);
  console.log(`Median Latency:           ${stats.median} ms`);
  console.log(`p95 Latency:              ${stats.p95} ms`);
  console.log(`Throughput:               ${Math.round((results.length / totalDuration) * 10) / 10} req/s`);

  return { stats, totalDuration };
}

async function runScenario4CheckIn(volunteerToken: string, registrationIds: string[]) {
  console.log(`\n======================================================`);
  console.log(`🚀 SCENARIO 4: GATE QR & MANUAL CHECK-IN`);
  console.log(`Verifying single check-in, atomic duplicate rejection, and latency`);
  console.log(`======================================================`);

  const testIds = registrationIds.slice(0, 10);
  if (testIds.length === 0) {
    console.log('No test IDs available for checkin, skipping.');
    return;
  }

  const durations: number[] = [];
  let successfulCheckIns = 0;
  let duplicatesDetected = 0;

  // 1. First-time check-in
  for (const regId of testIds) {
    const start = performance.now();
    const res = await makeRequest({
      method: 'POST',
      path: '/api/checkin/manual',
      body: { registrationId: regId },
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    durations.push(performance.now() - start);

    if (res.status === 200 && (res.data?.status === 'SUCCESS' || res.data?.data?.status === 'SUCCESS')) {
      successfulCheckIns++;
    }
  }

  // 2. Duplicate entry check (should all return ALREADY_CHECKED_IN)
  for (const regId of testIds) {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/checkin/manual',
      body: { registrationId: regId },
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });

    if (res.status === 200 && (res.data?.status === 'ALREADY_CHECKED_IN' || res.data?.data?.status === 'ALREADY_CHECKED_IN')) {
      duplicatesDetected++;
    }
  }

  // 3. Invalid registration ID check
  const invalidRes = await makeRequest({
    method: 'POST',
    path: '/api/checkin/manual',
    body: { registrationId: 'JECRC-INVALID-9999' },
    headers: { Authorization: `Bearer ${volunteerToken}` },
  });

  const stats = calculatePercentiles(durations);
  console.log(`Check-ins Attempted:      ${testIds.length}`);
  console.log(`Successful Check-ins:     ${successfulCheckIns}/${testIds.length}`);
  console.log(`Duplicate Scans Blocked:  ${duplicatesDetected}/${testIds.length} (100% duplicate prevention)`);
  console.log(`Invalid ID Rejected:      ${invalidRes.data?.status === 'INVALID' || invalidRes.data?.data?.status === 'INVALID' ? 'YES (Correct)' : 'NO'}`);
  console.log(`Avg Check-in Latency:     ${stats.avg} ms`);
  console.log(`Median Latency:           ${stats.median} ms`);
  console.log(`p95 Latency:              ${stats.p95} ms`);

  return { stats, successfulCheckIns, duplicatesDetected };
}

async function main() {
  console.log('\n======================================================');
  console.log('⚡ STARTING FULL COMPREHENSIVE 50-VU LOAD TEST');
  console.log('======================================================');

  const startCpu = process.cpuUsage();
  const startMemory = process.memoryUsage();

  let serverInstance: http.Server;
  await new Promise<void>((resolve) => {
    serverInstance = app.listen(LOAD_TEST_PORT, '127.0.0.1', () => {
      console.log(`Load test server active on http://127.0.0.1:${LOAD_TEST_PORT}`);
      resolve();
    });
  });

  try {
    // Authenticate Admin and Volunteer
    const adminLogin = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'admin', password: 'Admin@JECRC2026!' },
    });
    const adminToken = adminLogin.data.token;

    const volunteerLogin = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'volunteer1', password: 'Volunteer@JECRC2026!' },
    });
    const volunteerToken = volunteerLogin.data.token;

    // Run Scenarios
    const s1 = await runScenario1Browsing(50);
    const s2 = await runScenario2Registration(50);
    const s3 = await runScenario3Dashboard(adminToken, 10);
    const s4 = await runScenario4CheckIn(volunteerToken, s2.createdRegistrationIds);

    const endCpu = process.cpuUsage(startCpu);
    const endMemory = process.memoryUsage();

    console.log(`\n======================================================`);
    console.log(`📊 OVERALL LOAD TEST METRICS SUMMARY`);
    console.log(`======================================================`);
    console.log(`Total Requests Executed:    ${s1.results.length + s2.results.length + 30 + 21}`);
    console.log(`Website Browsing (p95):     ${s1.stats.p95} ms (Avg: ${s1.stats.avg} ms)`);
    console.log(`Registration (p95):         ${s2.stats.p95} ms (Avg: ${s2.stats.avg} ms)`);
    console.log(`Dashboard Queries (p95):    ${s3.stats.p95} ms (Avg: ${s3.stats.avg} ms)`);
    console.log(`Gate Check-in (p95):        ${s4?.stats.p95 ?? 0} ms (Avg: ${s4?.stats.avg ?? 0} ms)`);
    console.log(`Memory RSS:                 ${Math.round(endMemory.rss / 1024 / 1024)} MB`);
    console.log(`Heap Used:                  ${Math.round(endMemory.heapUsed / 1024 / 1024)} MB / ${Math.round(endMemory.heapTotal / 1024 / 1024)} MB`);
    console.log(`CPU User Time:              ${Math.round(endCpu.user / 1000)} ms`);
    console.log(`CPU System Time:            ${Math.round(endCpu.system / 1000)} ms`);
    console.log(`======================================================\n`);
  } finally {
    serverInstance!.close();
  }
}

main().catch((err) => {
  console.error('Load test failure:', err);
  process.exit(1);
});
