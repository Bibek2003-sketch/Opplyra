/**
 * Opplyra Opportunity Fraud & Scam Detector
 * 
 * Orchestrates explainable, evidence-grounded fraud analysis combining independent
 * message-content heuristics and URL security analysis.
 * 
 * DESIGN PRINCIPLES:
 * - Deterministic rule-based scoring (0 - 100).
 * - Independent text and URL evaluation without double-counting.
 * - Supports: (1) Message only, (2) URL only, (3) Message and URL together.
 * - Never claims an unverified opportunity is "Safe" or "Genuine".
 * - Clearly distinguishes rule-based scores from statistical probabilities.
 */

const { analyzeMessage } = require('./messageAnalyzer');
const { analyzeUrl } = require('./urlAnalyzer');
const { DATASET_VERSION, LAST_REVIEWED } = require('../data/fraudPatterns');

// Documented Risk Thresholds
const THRESHOLDS = {
  HIGH_RISK_MIN: 40,   // Score >= 40 or any CRITICAL indicator
  CAUTION_MIN: 15,     // Score >= 15 or any MEDIUM/HIGH indicator
};

/**
 * Generates tailored recommendations based on detected warning indicators.
 */
function generateRecommendations(indicators = [], urlAnalysis = {}) {
  const steps = [];

  const hasPaymentDemand = indicators.some((i) =>
    (i.category || '').includes('Fee') || (i.category || '').includes('Payment') || (i.ruleId || '').includes('FEE')
  );
  const hasCredentialTheft = indicators.some((i) =>
    (i.category || '').includes('Credential') || (i.ruleId || '').includes('CREDENTIAL') || (i.ruleId || '').includes('OTP')
  );
  const hasImpersonation = indicators.some((i) =>
    (i.category || '').includes('Impersonation') || (i.ruleId || '').includes('BRAND_SUBDOMAIN') || (i.ruleId || '').includes('IMPERSONATION')
  );
  const hasApkRequest = indicators.some((i) =>
    (i.category || '').includes('APK') || (i.ruleId || '').includes('APK') || (i.ruleId || '').includes('APP')
  );

  if (hasCredentialTheft) {
    steps.push('DO NOT share OTPs, PINs, card CVVs, or bank account passwords with anyone under any pretext.');
  }

  if (hasPaymentDemand) {
    steps.push('DO NOT transfer any fees or security deposits via UPI, Google Pay, or QR codes. Legitimate scholarships and employers never ask candidates to pay for appointments.');
  }

  if (hasApkRequest) {
    steps.push('DO NOT download APK files or install remote access software (AnyDesk, TeamViewer) on your phone or computer.');
  }

  if (hasImpersonation) {
    steps.push('Verify the announcement directly on the official careers page of the organization, not via WhatsApp or personal email.');
  }

  if (urlAnalysis?.hasUrl && !urlAnalysis.isAllowlisted) {
    steps.push(`Independently search for the official website of the issuing organization rather than following links from unsolicited messages.`);
  }

  // Baseline prudent next steps
  steps.push('Consult your college Training and Placement Cell (TPO) or faculty advisor before submitting sensitive personal documents.');
  steps.push('If you suspect an active fraud or financial extortion attempt, report it on India\'s National Cyber Crime Reporting Portal (cybercrime.gov.in).');

  return steps;
}

/**
 * Main Analysis Orchestration Entrypoint
 */
function analyzeAnnouncement({ text = '', url = '' }) {
  const trimmedText = (text || '').trim();
  const trimmedUrl = (url || '').trim();

  // 1. Handle Insufficient / Invalid Input
  const hasMinText = trimmedText.length >= 15;
  const hasUrl = Boolean(trimmedUrl);

  if (!hasMinText && !hasUrl) {
    return {
      status: 'Insufficient Input',
      classification: 'INVALID_INPUT',
      riskLevel: 'UNKNOWN',
      ruleBasedRiskScore: 0,
      summary: 'Please provide at least 15 characters of notice text, a website link, or both so we can analyze the announcement.',
      messageAnalysis: {
        hasText: false,
        textLength: trimmedText.length,
        indicators: [],
        score: 0,
      },
      urlAnalysis: {
        hasUrl: false,
        isValid: false,
        indicators: [],
        score: 0,
      },
      combinedIndicators: [],
      unverifiedAspects: [
        'Whether the notice or link represents a genuine educational or career program',
        'Whether fees or sensitive credentials will be demanded in subsequent steps',
        'Whether the contact persons actually represent the claimed organization',
      ],
      recommendedSteps: [
        'Paste the complete announcement message including contact details and instructions.',
        'Or enter the official website link given in the notification.',
      ],
      disclaimer: 'This check analyzes structural warning signs and text patterns. Static analysis cannot replace verification with official college placement authorities.',
      datasetVersion: DATASET_VERSION,
      lastReviewed: LAST_REVIEWED,
      analyzedAt: new Date().toISOString(),
    };
  }

  // 2. Run Independent Analyzers
  const messageResult = hasMinText
    ? analyzeMessage(trimmedText)
    : { hasText: false, textLength: 0, indicators: [], score: 0, negationDisclaimers: [] };

  const urlResult = hasUrl
    ? analyzeUrl(trimmedUrl, trimmedText)
    : { hasUrl: false, isValid: false, indicators: [], score: 0, reputationStatus: 'No URL provided' };

  // 3. Combine Evidence Without Double-Counting
  const seenRuleIds = new Set();
  const combinedIndicators = [];

  for (const ind of messageResult.indicators) {
    if (!seenRuleIds.has(ind.ruleId)) {
      seenRuleIds.add(ind.ruleId);
      combinedIndicators.push({
        source: 'message',
        ...ind,
      });
    }
  }

  for (const ind of urlResult.indicators) {
    if (!seenRuleIds.has(ind.ruleId)) {
      seenRuleIds.add(ind.ruleId);
      combinedIndicators.push({
        source: 'url',
        ...ind,
      });
    }
  }

  // 4. Calculate Combined Rule-Based Risk Score
  let combinedScore = messageResult.score + urlResult.score;

  // If verified official domain, apply mitigating discount unless critical credential/dangerous scheme exists
  if (urlResult.isAllowlisted && !combinedIndicators.some((i) => i.severity === 'CRITICAL')) {
    combinedScore = Math.max(0, combinedScore - 25);
  }

  combinedScore = Math.min(100, Math.max(0, combinedScore));

  // 5. Determine Classification Outcome
  const hasCritical = combinedIndicators.some((i) => i.severity === 'CRITICAL');
  const hasHigh = combinedIndicators.some((i) => i.severity === 'HIGH');

  let classification = 'LOWER_RISK';
  let riskLevel = 'LOWER RISK';
  let status = 'No major warning signs detected';
  let summary = messageResult.isEducationalAdvisory
    ? 'This announcement was recognized as an educational advisory or discussion of fraud prevention rather than an active scam. It discusses common warning signs for student awareness.'
    : 'No major warning signs were detected by this check. This does not prove the announcement is genuine or guarantee that the website is safe. Always verify through the official website.';

  if (hasCritical || combinedScore >= THRESHOLDS.HIGH_RISK_MIN) {
    classification = 'HIGH_RISK';
    riskLevel = 'HIGH RISK';
    status = 'Likely Scam / High Risk';
    const criticalCount = combinedIndicators.filter((i) => i.severity === 'CRITICAL').length;
    summary = `We detected ${combinedIndicators.length} warning indicator(s), including ${criticalCount > 0 ? `${criticalCount} major red flag(s)` : 'high-risk patterns'}. Do not pay any money or share sensitive credentials.`;
  } else if (hasHigh || combinedScore >= THRESHOLDS.CAUTION_MIN || (urlResult.hasUrl && !urlResult.isAllowlisted)) {
    classification = 'CAUTION';
    riskLevel = 'CAUTION';
    status = 'Needs Further Verification';
    summary = combinedIndicators.length > 0
      ? `We found ${combinedIndicators.length} suspicious indicator(s) that require careful verification before you proceed.`
      : `The announcement does not match confirmed scam patterns, but points to an unvetted third-party domain (${urlResult.hostname || 'external link'}). Check with official authorities.`;
  }

  // 6. Assembly of Unverified Aspects & Actionable Recommendations
  const unverifiedAspects = [
    'Whether the person sending this announcement genuinely represents the claimed organization',
    'Whether hidden charges or fees will be demanded during private WhatsApp or phone calls',
    'Whether unverified interview tasks or test assignments violate intellectual property or data safety',
  ];

  const recommendedSteps = generateRecommendations(combinedIndicators, urlResult);

  return {
    status,
    classification,
    riskLevel,
    ruleBasedRiskScore: combinedScore,
    summary,
    inputMode: hasMinText && hasUrl ? 'MESSAGE_AND_URL' : hasMinText ? 'MESSAGE_ONLY' : 'URL_ONLY',
    messageAnalysis: {
      hasText: messageResult.hasText,
      textLength: messageResult.textLength,
      indicatorCount: messageResult.indicators.length,
      indicators: messageResult.indicators,
      negationDisclaimers: messageResult.negationDisclaimers,
      isEducationalAdvisory: Boolean(messageResult.isEducationalAdvisory),
      score: messageResult.score,
    },
    urlAnalysis: {
      hasUrl: urlResult.hasUrl,
      isValid: urlResult.isValid,
      rawUrl: urlResult.rawUrl,
      protocol: urlResult.protocol,
      hostname: urlResult.hostname,
      isAllowlisted: urlResult.isAllowlisted,
      allowlistCategory: urlResult.allowlistCategory,
      isShortener: urlResult.isShortener,
      isFreeHosting: urlResult.isFreeHosting,
      indicatorCount: urlResult.indicators.length,
      indicators: urlResult.indicators,
      reputationServiceStatus: urlResult.reputationStatus,
      score: urlResult.score,
    },
    combinedIndicators,
    unverifiedAspects,
    recommendedSteps,
    disclaimer: 'No major warning signs were detected by this check. This does not prove the announcement is genuine or guarantee that the website is safe. Always confirm with the official organization.',
    datasetVersion: DATASET_VERSION,
    lastReviewed: LAST_REVIEWED,
    analyzedAt: new Date().toISOString(),
  };
}

module.exports = {
  analyzeAnnouncement,
  THRESHOLDS,
};
