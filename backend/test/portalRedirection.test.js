process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const { connectDB } = require('../src/config/db');
const { sampleOpportunities } = require('../src/seeds/seedData');
const { validateUrlFormat, isPrivateOrReservedIp, validateSsrfTarget } = require('../src/services/linkHealthService');
const opportunityController = require('../src/controllers/opportunityController');
const applicationController = require('../src/controllers/applicationController');
const memoryStore = require('../src/services/memoryStore');

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

test('Official Application Portal Redirection & Link Safety Suite', async (suite) => {
  await connectDB();
  const testStudent = { id: 'test_student_link_auditor', email: 'auditor@college.edu', fullName: 'Link Auditor' };

  await suite.test('1. Audits seed opportunities: Zero demo URLs, all official organizations verified', async () => {
    assert.equal(sampleOpportunities.length, 8);

    for (const opp of sampleOpportunities) {
      // 1. Must not contain demo or placeholder markers in URL
      assert.ok(!opp.sourceUrl.includes('/demo/'), `Found /demo/ in ${opp.title}: ${opp.sourceUrl}`);
      assert.ok(!opp.sourceUrl.includes('-demo'), `Found -demo in ${opp.title}: ${opp.sourceUrl}`);
      assert.ok(!opp.sourceUrl.includes('demo-portal'), `Found demo-portal in ${opp.title}: ${opp.sourceUrl}`);

      // 2. Must be valid HTTP or HTTPS protocol
      assert.ok(opp.sourceUrl.startsWith('https://') || opp.sourceUrl.startsWith('http://'));

      // 3. Must have verified status and official homepage URL
      assert.equal(opp.urlVerificationStatus, 'verified');
      assert.ok(opp.officialHomepageUrl);
      assert.ok(opp.sourceDomain);
    }
  });

  await suite.test('2. Verifies specific scholarship no longer contains /demo/ and uses official portal', async () => {
    const stemScholarship = sampleOpportunities.find((o) =>
      o.title.includes('National Merit Post-Matric STEM Scholarship')
    );
    assert.ok(stemScholarship);
    assert.equal(stemScholarship.sourceUrl, 'https://scholarships.gov.in/Students');
    assert.equal(stemScholarship.officialHomepageUrl, 'https://scholarships.gov.in/');
    assert.equal(stemScholarship.sourceDomain, 'scholarships.gov.in');
  });

  await suite.test('3. Verifies Google fellowship uses official Google Research careers portal', async () => {
    const googleFellowship = sampleOpportunities.find((o) =>
      o.title.includes('Google Student Research Fellow')
    );
    assert.ok(googleFellowship);
    assert.equal(googleFellowship.sourceUrl, 'https://research.google/careers/');
    assert.equal(googleFellowship.officialHomepageUrl, 'https://research.google/');
    assert.equal(googleFellowship.sourceDomain, 'research.google');
  });

  await suite.test('4. Validates URL format: Rejects malformed URLs and unsafe protocols', async () => {
    // Valid HTTPS
    const valid = validateUrlFormat('https://scholarships.gov.in/Students');
    assert.equal(valid.valid, true);

    // Rejects javascript: protocol
    const jsScheme = validateUrlFormat('javascript:alert(1)');
    assert.equal(jsScheme.valid, false);

    // Rejects file: protocol
    const fileScheme = validateUrlFormat('file:///etc/passwd');
    assert.equal(fileScheme.valid, false);

    // Rejects empty or missing
    const empty = validateUrlFormat('');
    assert.equal(empty.valid, false);

    // Rejects credential injection
    const withCreds = validateUrlFormat('https://admin:secret@malicious.com/exploit');
    assert.equal(withCreds.valid, false);
    assert.ok(withCreds.reason.includes('credentials'));
  });

  await suite.test('5. SSRF Protection: Blocks private, loopback, and cloud metadata IP ranges', async () => {
    // Loopback
    assert.equal(isPrivateOrReservedIp('127.0.0.1'), true);
    assert.equal(isPrivateOrReservedIp('127.255.255.254'), true);
    assert.equal(isPrivateOrReservedIp('::1'), true);

    // Cloud Metadata endpoint
    assert.equal(isPrivateOrReservedIp('169.254.169.254'), true);

    // Private IPv4 ranges
    assert.equal(isPrivateOrReservedIp('10.0.0.1'), true);
    assert.equal(isPrivateOrReservedIp('172.16.0.1'), true);
    assert.equal(isPrivateOrReservedIp('172.31.255.255'), true);
    assert.equal(isPrivateOrReservedIp('192.168.1.1'), true);

    // Broadcast & 0.0.0.0
    assert.equal(isPrivateOrReservedIp('0.0.0.0'), true);
    assert.equal(isPrivateOrReservedIp('255.255.255.255'), true);

    // Public IPs are not private
    assert.equal(isPrivateOrReservedIp('8.8.8.8'), false);
    assert.equal(isPrivateOrReservedIp('1.1.1.1'), false);

    // Target hostname check
    const localHostCheck = await validateSsrfTarget('localhost');
    assert.equal(localHostCheck.safe, false);

    const internalHostCheck = await validateSsrfTarget('database.internal');
    assert.equal(internalHostCheck.safe, false);
  });

  await suite.test('6. Application tracking inherits official URL and verification metadata from opportunity', async () => {
    const opp = memoryStore.opportunities[0];
    const createReq = {
      user: testStudent,
      body: {
        opportunityId: opp._id,
        status: 'Application Started',
      },
    };
    const createRes = createMockRes();
    await applicationController.createApplication(createReq, createRes);

    assert.equal(createRes.statusCode, 201);
    assert.equal(createRes.body.success, true);
    assert.equal(createRes.body.data.officialApplicationUrl, opp.sourceUrl);
    assert.equal(createRes.body.data.officialHomepageUrl, opp.officialHomepageUrl);
    assert.equal(createRes.body.data.urlVerificationStatus, 'verified');
  });

  await suite.test('7. Link health check endpoint returns classified status for opportunity', async () => {
    const opp = memoryStore.opportunities[0];
    const checkReq = { params: { id: opp._id } };
    const checkRes = createMockRes();
    await opportunityController.checkOpportunityLink(checkReq, checkRes);

    assert.equal(checkRes.statusCode, 200);
    assert.equal(checkRes.body.success, true);
    assert.ok(checkRes.body.data.targetUrl);
    assert.ok(checkRes.body.data.status);
  });

  await suite.test('8. Broken link report records student submission accurately', async () => {
    const opp = memoryStore.opportunities[0];
    const reportReq = {
      params: { id: opp._id },
      user: testStudent,
      body: {
        reason: 'page_not_found',
        comments: 'Official portal updated their student login page',
      },
    };
    const reportRes = createMockRes();
    await opportunityController.reportOpportunityLink(reportReq, reportRes);

    assert.equal(reportRes.statusCode, 200);
    assert.equal(reportRes.body.success, true);
    assert.ok(reportRes.body.message.includes('flagged this link'));

    // Check report stored in memory
    const reports = memoryStore.getBrokenLinkReports();
    assert.ok(reports.length > 0);
    assert.equal(reports[0].opportunityId, opp._id);
    assert.equal(reports[0].reason, 'page_not_found');
  });
});

