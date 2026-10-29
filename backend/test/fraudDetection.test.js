process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeAnnouncement } = require('../src/services/ruleEngine');
const { verifyAnnouncement, getExamples } = require('../src/controllers/verificationController');

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

test('Opplyra Comprehensive Opportunity Fraud Detector Test Suite', async (suite) => {
  // -------------------------------------------------------------------------
  // Scenario 1: Scholarship award requiring a refundable processing fee of ₹1,499
  // -------------------------------------------------------------------------
  await suite.test('Scenario 1: Detects scholarship award requiring refundable processing fee', () => {
    const text = 'Congratulations! You have been selected for the National Merit Scholarship 2026. To release your scholarship grant of ₹50,000, candidates must pay a refundable processing fee of ₹1,499 to verify your bank account.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.equal(result.riskLevel, 'HIGH RISK');
    assert.ok(result.ruleBasedRiskScore >= 40);
    assert.ok(result.combinedIndicators.some((i) => i.category === 'Advance-Fee Fraud' || i.ruleId.includes('SCHOLARSHIP')));
  });

  // -------------------------------------------------------------------------
  // Scenario 2: Work-from-home job promising ₹5,000–₹8,000 daily and requiring a registration fee
  // -------------------------------------------------------------------------
  await suite.test('Scenario 2: Detects WFH job promising ₹5,000-₹8,000 daily with registration fee', () => {
    const text = 'Hiring urgently: Online Part Time Work From Home. Promising ₹5,000–₹8,000 daily for simple data entry. Candidates must pay a one-time registration fee of ₹999 to start work.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.ruleBasedRiskScore >= 40);
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'ADVANCE_FEE_JOB_ONBOARDING'));
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'FAKE_JOB_UNREALISTIC_EARNINGS'));
  });

  // -------------------------------------------------------------------------
  // Scenario 3: Internship offer promising selection without an interview and demanding payment for an ID card or certificate
  // -------------------------------------------------------------------------
  await suite.test('Scenario 3: Detects internship selection without interview & payment for ID card/certificate', () => {
    const text = 'Summer Internship Opportunity: We are offering guaranteed selection without an interview. Selected candidates are required to make a payment for ID card and training certificate before joining.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'FAKE_OFFER_NO_INTERVIEW_GUARANTEE'));
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'FAKE_INTERNSHIP_PAID_CERTIFICATE' || i.ruleId === 'ADVANCE_FEE_JOB_ONBOARDING'));
  });

  // -------------------------------------------------------------------------
  // Scenario 4: Scholarship message asking for a bank OTP, ATM PIN, and password
  // -------------------------------------------------------------------------
  await suite.test('Scenario 4: Detects explicit request for bank OTP, ATM PIN, and password', () => {
    const text = 'Your scholarship funds are ready for transfer. To complete verification, please submit your bank OTP, ATM PIN, and account login password immediately.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    const criticalIndicator = result.combinedIndicators.find((i) => i.severity === 'CRITICAL');
    assert.ok(criticalIndicator);
    assert.ok(result.combinedIndicators.some((i) => i.category === 'Credential & Banking Theft'));
  });

  // -------------------------------------------------------------------------
  // Scenario 5: Government recruitment announcement promising direct appointment in exchange for a UPI payment
  // -------------------------------------------------------------------------
  await suite.test('Scenario 5: Detects government recruitment promising direct appointment for UPI payment', () => {
    const text = 'Ministry of Transport Recruitment: Direct appointment for technical assistant posts. Transfer application charges to UPI ID gov.recruitment@oksbi to confirm your seat.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'ADVANCE_FEE_UNOFFICIAL_UPI_WALLET'));
  });

  // -------------------------------------------------------------------------
  // Scenario 6: Internship certificate sold without attendance or completed work
  // -------------------------------------------------------------------------
  await suite.test('Scenario 6: Detects internship certificate sold without attendance or work', () => {
    const text = 'Need an internship certificate for your college submission? Get a verified internship certificate without attendance or doing any project work. Fast delivery to your address.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'FAKE_INTERNSHIP_NO_WORK_SOLD'));
  });

  // -------------------------------------------------------------------------
  // Scenario 7: Campus recruitment selection requiring a refundable security deposit
  // -------------------------------------------------------------------------
  await suite.test('Scenario 7: Detects campus recruitment requiring a refundable security deposit', () => {
    const text = 'Shortlisted candidate notification: You have cleared campus recruitment screening. Please deposit a refundable security amount of ₹3,500 to reserve your joining batch.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'ADVANCE_FEE_REFUNDABLE_DEPOSIT'));
  });

  // -------------------------------------------------------------------------
  // Scenario 8: Messaging-group invitation demanding payment and sensitive personal information
  // -------------------------------------------------------------------------
  await suite.test('Scenario 8: Detects messaging group invitation demanding entry fee and identity documents', () => {
    const text = 'Join our exclusive placement WhatsApp group for guaranteed job openings. Pay an entry fee of ₹500 and send your Aadhaar card, PAN card, and bank passbook photo to the group admin.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'IMPERSONATION_MESSAGING_APP_RECRUITMENT'));
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'CREDENTIAL_SENSITIVE_DOCS_DEMAND'));
  });

  // -------------------------------------------------------------------------
  // Scenario 9: Application portal asking for email credentials and bank details
  // -------------------------------------------------------------------------
  await suite.test('Scenario 9: Detects application portal harvesting email passwords and bank account details', () => {
    const text = 'Portal verification required: Enter your email address and email password along with your bank account number and bank details to activate your student placement profile.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'CREDENTIAL_PASSWORD_THEFT' || i.ruleId === 'CREDENTIAL_SENSITIVE_DOCS_DEMAND'));
  });

  // -------------------------------------------------------------------------
  // Scenario 10: Education reward requiring payment to release a promised prize
  // -------------------------------------------------------------------------
  await suite.test('Scenario 10: Detects education reward demanding payment to release a promised prize', () => {
    const text = 'You have been awarded the National Student Achievement Prize worth ₹25,000 and a laptop! Pay ₹1,200 shipping and handling charges to release your prize.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.combinedIndicators.some((i) => i.ruleId === 'ADVANCE_FEE_PRIZE_RELEASE'));
  });

  // -------------------------------------------------------------------------
  // Scenario 11: Benign scholarship announcement with eligibility and normal deadline
  // -------------------------------------------------------------------------
  await suite.test('Scenario 11: Assesses benign official scholarship notice as LOWER_RISK with 0 warnings', () => {
    const text = 'National Fellowship for Higher Education 2026: Applications are invited from eligible postgraduate students holding at least 60% marks. The deadline for online submission is November 30, 2026. Selection is strictly on academic merit.';
    const result = analyzeAnnouncement({
      text,
      url: 'https://scholarships.gov.in',
    });

    assert.equal(result.classification, 'LOWER_RISK');
    assert.equal(result.ruleBasedRiskScore, 0);
    assert.equal(result.combinedIndicators.length, 0);
    assert.ok(result.urlAnalysis.isAllowlisted);
  });

  // -------------------------------------------------------------------------
  // Scenario 12: Ambiguous internship announcement without explicit payments or sensitive requests
  // -------------------------------------------------------------------------
  await suite.test('Scenario 12: Assesses ambiguous third-party career notice as CAUTION (not HIGH_RISK)', () => {
    const text = 'Summer Tech Internship 2026 updates: Selected companies in Bangalore are opening application windows for engineering students. Check the student community discussion board for links to original company career listings.';
    const result = analyzeAnnouncement({
      text,
      url: 'https://tech-student-updates-hub.com/internships',
    });

    assert.equal(result.classification, 'CAUTION');
    assert.notEqual(result.classification, 'HIGH_RISK');
    assert.equal(result.urlAnalysis.isAllowlisted, false);
  });

  // -------------------------------------------------------------------------
  // Scenario 13: Message discussing scam warning signs for educational purposes
  // -------------------------------------------------------------------------
  await suite.test('Scenario 13: Recognizes educational advisory discussing scam signs without false alarm', () => {
    const text = 'Educational Advisory on Student Frauds: Be aware that common student scams often demand a refundable processing fee of ₹1,499 or ask for bank OTPs and passwords. Legitimate scholarships never collect fees or request ATM PINs. If an offer promises guaranteed selection without an interview, report it immediately.';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'LOWER_RISK');
    assert.notEqual(result.classification, 'HIGH_RISK');
    assert.ok(result.messageAnalysis.isEducationalAdvisory);
    assert.match(result.summary, /educational advisory/i);
  });

  // -------------------------------------------------------------------------
  // Scenario 14: Paraphrased scam messages with erratic casing, spacing, and punctuation
  // -------------------------------------------------------------------------
  await suite.test('Scenario 14: Detects paraphrased scam with erratic casing, punctuation, and extra whitespace', () => {
    const text = '   uRgEnT!  nAtIoNaL  sChOlArShIp   aWaRd:  tO   cLaIm  yOuR  gRaNt,  kInDlY   dEpOsIt   a   rEfUnDaBlE   pRoCeSsInG   fEe   oF   rs. 1499/-   vIa   uPi   iMmEdIaTeLy!   ';
    const result = analyzeAnnouncement({ text });

    assert.equal(result.classification, 'HIGH_RISK');
    assert.ok(result.ruleBasedRiskScore >= 40);
    assert.ok(result.combinedIndicators.length >= 1);
  });

  // -------------------------------------------------------------------------
  // Scenario 15: URL-only, message-only, and combined submissions
  // -------------------------------------------------------------------------
  await suite.test('Scenario 15: Evaluates all three input modes independently and correctly', () => {
    // Mode 1: Message only
    const msgOnly = analyzeAnnouncement({
      text: 'Direct joining in public sector bank. Pay refundable laptop security deposit of Rs 3,000 via Google Pay / UPI.',
    });
    assert.equal(msgOnly.inputMode, 'MESSAGE_ONLY');
    assert.ok(msgOnly.messageAnalysis.hasText);
    assert.equal(msgOnly.urlAnalysis.hasUrl, false);
    assert.equal(msgOnly.classification, 'HIGH_RISK');

    // Mode 2: URL only
    const urlOnly = analyzeAnnouncement({
      url: 'https://isro.gov.in.careers-apply.xyz/trainee',
    });
    assert.equal(urlOnly.inputMode, 'URL_ONLY');
    assert.equal(urlOnly.messageAnalysis.hasText, false);
    assert.ok(urlOnly.urlAnalysis.hasUrl);
    assert.equal(urlOnly.classification, 'HIGH_RISK');

    // Mode 3: Combined
    const combined = analyzeAnnouncement({
      text: 'Direct Railway recruitment registration open. Deposit caution fee before midnight.',
      url: 'http://railway-jobs-direct.xyz',
    });
    assert.equal(combined.inputMode, 'MESSAGE_AND_URL');
    assert.ok(combined.messageAnalysis.hasText);
    assert.ok(combined.urlAnalysis.hasUrl);
  });

  // -------------------------------------------------------------------------
  // Scenario 16: Empty, invalid, oversized, and malformed inputs
  // -------------------------------------------------------------------------
  await suite.test('Scenario 16: Handles empty, short, malformed, and oversized inputs securely', async () => {
    // Empty input returns INVALID_INPUT
    const emptyResult = analyzeAnnouncement({ text: '', url: '' });
    assert.equal(emptyResult.classification, 'INVALID_INPUT');
    assert.equal(emptyResult.ruleBasedRiskScore, 0);

    // Whitespace only
    const wsResult = analyzeAnnouncement({ text: '    ', url: '   ' });
    assert.equal(wsResult.classification, 'INVALID_INPUT');

    // Text below 15 characters without URL
    const shortResult = analyzeAnnouncement({ text: 'Hello short' });
    assert.equal(shortResult.classification, 'INVALID_INPUT');

    // Malformed dangerous protocol
    const dangerousScheme = analyzeAnnouncement({ url: 'javascript:alert(1)' });
    assert.ok(dangerousScheme.urlAnalysis.indicators.some((i) => i.ruleId === 'URL_DANGEROUS_SCHEME'));

    // Controller payload validation: text > 25,000 characters
    const bigReq = { body: { text: 'X'.repeat(25001), url: '' } };
    const bigRes = createMockRes();
    await verifyAnnouncement(bigReq, bigRes);
    assert.equal(bigRes.statusCode, 400);
    assert.match(bigRes.body.message, /25,000 characters/i);

    // Controller payload validation: url > 2,048 characters
    const bigUrlReq = { body: { text: '', url: 'https://example.com/' + 'a'.repeat(2050) } };
    const bigUrlRes = createMockRes();
    await verifyAnnouncement(bigUrlReq, bigUrlRes);
    assert.equal(bigUrlRes.statusCode, 400);
    assert.match(bigUrlRes.body.message, /2,048 characters/i);
  });

  // -------------------------------------------------------------------------
  // Controller Endpoints & Demonstration Examples
  // -------------------------------------------------------------------------
  await suite.test('17. Verification Controller serves verified demonstration library', async () => {
    const req = {};
    const res = createMockRes();
    await getExamples(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 6);

    res.body.data.forEach((ex) => {
      assert.equal(ex.isDemonstration, true);
      assert.ok(Boolean(ex.expectedOutcome));
    });
  });

  // -------------------------------------------------------------------------
  // Synthetic Benchmark Evaluation (Precision & Recall)
  // -------------------------------------------------------------------------
  await suite.test('18. Synthetic benchmark metrics: Evaluates precision & recall on synthetic test set', () => {
    const benchmarkSet = [
      // 10 Scams
      { text: 'Congratulations! You have been selected for the National Merit Scholarship 2026. To release your scholarship grant of ₹50,000, candidates must pay a refundable processing fee of ₹1,499 to verify your bank account.', isScam: true },
      { text: 'Hiring urgently: Online Part Time Work From Home. Promising ₹5,000–₹8,000 daily for simple data entry. Candidates must pay a one-time registration fee of ₹999 to start work.', isScam: true },
      { text: 'Summer Internship Opportunity: We are offering guaranteed selection without an interview. Selected candidates are required to make a payment for ID card and training certificate before joining.', isScam: true },
      { text: 'Your scholarship funds are ready for transfer. To complete verification, please submit your bank OTP, ATM PIN, and account login password immediately.', isScam: true },
      { text: 'Ministry of Transport Recruitment: Direct appointment for technical assistant posts. Transfer application charges to UPI ID gov.recruitment@oksbi to confirm your seat.', isScam: true },
      { text: 'Need an internship certificate for your college submission? Get a verified internship certificate without attendance or doing any project work. Fast delivery to your address.', isScam: true },
      { text: 'Shortlisted candidate notification: You have cleared campus recruitment screening. Please deposit a refundable security amount of ₹3,500 to reserve your joining batch.', isScam: true },
      { text: 'Join our exclusive placement WhatsApp group for guaranteed job openings. Pay an entry fee of ₹500 and send your Aadhaar card, PAN card, and bank passbook photo to the group admin.', isScam: true },
      { text: 'Portal verification required: Enter your email address and email password along with your bank account number and bank details to activate your student placement profile.', isScam: true },
      { text: 'You have been awarded the National Student Achievement Prize worth ₹25,000 and a laptop! Pay ₹1,200 shipping and handling charges to release your prize.', isScam: true },

      // 5 Benign & Controls
      { text: 'National Fellowship for Higher Education 2026: Applications are invited from eligible postgraduate students holding at least 60% marks. The deadline for online submission is November 30, 2026. Selection is strictly on academic merit.', url: 'https://scholarships.gov.in', isScam: false },
      { text: 'Graduate Aptitude Test in Engineering (GATE 2026). Organizing Institute invites online applications from eligible candidates for admission to Master programs. Review brochure at official gate portal.', url: 'https://gate.iitk.ac.in', isScam: false },
      { text: 'Defence Research and Development Organisation (DRDO) announces Junior Research Fellowship. Selection based purely on GATE score and interview at RAC.', url: 'https://www.drdo.gov.in/careers', isScam: false },
      { text: 'Tata Consultancy Services National Qualifier Test (TCS NQT) registration. Review eligibility criteria and register on official TCS iON portal.', url: 'https://learning.tcsionhub.in', isScam: false },
      { text: 'Educational Advisory on Student Frauds: Be aware that common student scams often demand a refundable processing fee of ₹1,499 or ask for bank OTPs and passwords. Legitimate scholarships never collect fees or request ATM PINs. If an offer promises guaranteed selection without an interview, report it immediately.', isScam: false },
    ];

    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;

    benchmarkSet.forEach((item) => {
      const res = analyzeAnnouncement({ text: item.text, url: item.url });
      const predictedScam = res.classification === 'HIGH_RISK';

      if (item.isScam && predictedScam) tp++;
      else if (!item.isScam && predictedScam) fp++;
      else if (!item.isScam && !predictedScam) tn++;
      else if (item.isScam && !predictedScam) fn++;
    });

    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1 = (2 * precision * recall) / (precision + recall || 1);

    console.log(`\n======================================================`);
    console.log(`Synthetic Benchmark Performance (N=${benchmarkSet.length}):`);
    console.log(`TP: ${tp} / 10 | FP: ${fp} / 5 | TN: ${tn} / 5 | FN: ${fn} / 10`);
    console.log(`Precision: ${(precision * 100).toFixed(1)}%`);
    console.log(`Recall: ${(recall * 100).toFixed(1)}%`);
    console.log(`F1 Score: ${(f1 * 100).toFixed(1)}%`);
    console.log(`Note: Benchmark evaluated on synthetic test fixtures.`);
    console.log(`Performance on synthetic vectors does not guarantee real-world zero-day accuracy.`);
    console.log(`======================================================\n`);

    assert.equal(tp, 10, 'All 10 synthetic scam messages must be classified as HIGH_RISK');
    assert.equal(fp, 0, 'No benign or educational message must be falsely classified as HIGH_RISK');
    assert.equal(precision, 1.0);
    assert.equal(recall, 1.0);
  });
});
