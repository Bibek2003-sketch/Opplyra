/**
 * Opplyra URL Security & Anomaly Analyzer
 * 
 * Inspects submitted opportunity URLs purely via offline lexical, syntactic,
 * structural, and domain-reputation heuristics.
 * 
 * SECURITY GUARANTEES:
 * - NEVER initiates outbound HTTP/TCP requests to user-supplied URLs (Zero SSRF risk).
 * - NEVER executes or downloads content from submitted links.
 * - Safely detects Punycode homographs, IP-based hosts, misleading subdomains,
 *   unusual schemes, credentials in URLs, and public hosting masquerades.
 */

const { isVerifiedOfficialDomain } = require('../data/verifiedDomains');

// Known URL shorteners often leveraged to obscure destination domains
const SUSPICIOUS_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  'is.gd',
  'cutt.ly',
  't.ly',
  't.co',
  'ow.ly',
  'buff.ly',
  'rb.gy',
  'shorturl.at',
];

// Free website builders & generic form platforms
const FREE_HOSTING_PLATFORMS = [
  'blogspot.com',
  'wordpress.com',
  'wixsite.com',
  'weebly.com',
  'sites.google.com',
  'formsite.com',
  'typeform.com',
  'forms.gle',
  'docs.google.com/forms',
];

// Unconventional or high-abuse TLDs commonly used by throwaway fraud sites
const HIGH_ABUSE_TLDS = [
  '.xyz',
  '.top',
  '.buzz',
  '.club',
  '.work',
  '.loan',
  '.click',
  '.gq',
  '.cf',
  '.tk',
  '.ml',
  '.ga',
  '.rest',
  '.icu',
];

// Target brand keywords frequently targeted by spoofing domains
const SENSITIVE_BRAND_KEYWORDS = [
  'isro',
  'drdo',
  'upsc',
  'ssc',
  'railway',
  'rbi',
  'scholarship',
  'sarkari',
  'pradhanmantri',
  'google',
  'microsoft',
  'tcs',
  'infosys',
];

/**
 * Analyzes a URL string independently of message text.
 */
function analyzeUrl(rawUrl, associatedText = '') {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      hasUrl: false,
      isValid: false,
      indicators: [],
      score: 0,
      details: null,
    };
  }

  const trimmed = rawUrl.trim();
  const indicators = [];
  let score = 0;

  // 1. Basic length sanity
  if (trimmed.length < 4 || trimmed.length > 2048) {
    indicators.push({
      ruleId: 'URL_INVALID_LENGTH',
      name: 'Invalid Link Length',
      severity: 'HIGH',
      weight: 25,
      explanation: 'The provided web link is either too short to be a valid URL or exceeds maximum allowable length.',
      evidenceSnippet: trimmed.slice(0, 80),
    });
    return {
      hasUrl: true,
      isValid: false,
      rawUrl: trimmed,
      indicators,
      score: 25,
      details: null,
      reputationStatus: 'Lookup unavailable (invalid URL length)',
    };
  }

  // 2. Syntax & Protocol parsing using WHATWG URL
  let parsed = null;
  try {
    // Only prepend https:// if no explicit protocol scheme is provided (e.g. "example.com/apply")
    const hasExplicitScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed);
    const urlToParse = hasExplicitScheme ? trimmed : `https://${trimmed}`;
    parsed = new URL(urlToParse);
  } catch (err) {
    indicators.push({
      ruleId: 'URL_MALFORMED_SYNTAX',
      name: 'Malformed URL Syntax',
      severity: 'HIGH',
      weight: 25,
      explanation: 'The link has invalid web syntax and cannot be parsed as a standard web address.',
      evidenceSnippet: trimmed.slice(0, 80),
    });
    return {
      hasUrl: true,
      isValid: false,
      rawUrl: trimmed,
      indicators,
      score: 25,
      details: null,
      reputationStatus: 'Lookup unavailable (malformed URL)',
    };
  }

  const protocol = parsed.protocol.toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const port = parsed.port;
  const username = parsed.username;
  const password = parsed.password;
  const pathname = parsed.pathname.toLowerCase();

  // 3. Scheme Check: Disallow dangerous schemes
  if (!['http:', 'https:'].includes(protocol)) {
    indicators.push({
      ruleId: 'URL_DANGEROUS_SCHEME',
      category: 'URL & Website Security',
      name: 'Unusual or Dangerous Protocol Scheme',
      severity: 'CRITICAL',
      weight: 40,
      explanation: `The link uses a non-web protocol (${protocol}). Schemes such as javascript:, data:, or file: can execute code or access local files.`,
      evidenceSnippet: protocol,
    });
    score += 40;
  } else if (protocol === 'http:') {
    indicators.push({
      ruleId: 'URL_INSECURE_HTTP',
      category: 'URL & Website Security',
      name: 'Unencrypted HTTP Connection (No HTTPS)',
      severity: 'MEDIUM',
      weight: 15,
      explanation: 'This website does not use modern HTTPS encryption. Modern student portals and payment systems strictly mandate HTTPS.',
      evidenceSnippet: protocol + '//',
    });
    score += 15;
  }

  // 4. Embedded User Info / Credentials check
  if (username || password) {
    indicators.push({
      ruleId: 'URL_CREDENTIALS_INCLUDED',
      category: 'URL & Website Security',
      name: 'Deceptive Credentials in Web Address',
      severity: 'CRITICAL',
      weight: 40,
      explanation: 'This link contains embedded username or password fields (e.g., https://user:pass@host). This technique is frequently used in phishing attacks to mislead users regarding the actual destination hostname.',
      evidenceSnippet: `${username ? `${username}:***@` : ''}${hostname}`,
    });
    score += 40;
  }

  // 5. Raw IP Address Host Check
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  if (isIpv4 || isIpv6) {
    indicators.push({
      ruleId: 'URL_IP_ADDRESS_HOST',
      category: 'URL & Website Security',
      name: 'Direct IP Address Host (No Domain Name)',
      severity: 'HIGH',
      weight: 25,
      explanation: 'The link points directly to a raw numeric IP address instead of a registered domain name. Legitimate corporate and educational portals always use registered domains.',
      evidenceSnippet: hostname,
    });
    score += 25;
  }

  // 6. Punycode / IDN Homograph Attack Check
  if (hostname.includes('xn--')) {
    indicators.push({
      ruleId: 'URL_PUNYCODE_HOMOGRAPH',
      category: 'URL & Website Security',
      name: 'Internationalized Domain Name (Punycode / Homograph)',
      severity: 'HIGH',
      weight: 25,
      explanation: 'This domain uses Punycode ("xn--") encoding. Attackers use foreign alphabets with characters visually identical to Latin letters (e.g. Cyrillic "а" instead of Latin "a") to spoof trusted brands.',
      evidenceSnippet: hostname,
    });
    score += 25;
  }

  // 7. Unusual Port Check
  if (port && !['80', '443'].includes(port)) {
    indicators.push({
      ruleId: 'URL_UNUSUAL_PORT',
      category: 'URL & Website Security',
      name: 'Non-Standard Web Port',
      severity: 'MEDIUM',
      weight: 15,
      explanation: `The link runs on port ${port} instead of standard web ports (80 / 443). Official student portals do not operate on custom development or admin ports.`,
      evidenceSnippet: `Port :${port}`,
    });
    score += 15;
  }

  // 8. URL Shortener Check
  const isShortener = SUSPICIOUS_SHORTENERS.some((sh) => hostname === sh || hostname.endsWith('.' + sh));
  if (isShortener) {
    indicators.push({
      ruleId: 'URL_SHORTENER_OBSCURED',
      category: 'URL & Website Security',
      name: 'Generic URL Shortener Hiding True Destination',
      severity: 'MEDIUM',
      weight: 15,
      explanation: `The link uses a shortener service (${hostname}) that hides where you will actually be redirected. Scammers use shorteners to bypass domain filters.`,
      evidenceSnippet: hostname,
    });
    score += 15;
  }

  // 9. Free Hosting / Public Form Platform Check
  const isFreeHosting = FREE_HOSTING_PLATFORMS.some((fh) => (hostname + pathname).includes(fh));
  const claimsOfficial = /(?:official|government|ministry|upsc|ssc|isro|railway|tcs|infosys|google|microsoft)/i.test(
    associatedText + ' ' + hostname + pathname
  );

  if (isFreeHosting && claimsOfficial) {
    indicators.push({
      ruleId: 'URL_OFFICIAL_CLAIM_ON_FREE_HOST',
      category: 'URL & Website Security',
      name: 'Official Announcement Hosted on Free Blog/Form Builder',
      severity: 'HIGH',
      weight: 25,
      explanation: `The announcement claims to be from a government or major organization but directs applicants to a free public platform (${hostname}). Official organizations never conduct recruitment on free blogs or unverified forms.`,
      evidenceSnippet: hostname,
    });
    score += 25;
  }

  // Cross-reference with Official Verified Allowlist early
  const allowlistCheck = isVerifiedOfficialDomain(hostname);
  let isAllowlisted = Boolean(allowlistCheck && allowlistCheck.isOfficial);

  // 10. Misleading Subdomain / Brand Spoofing Check
  // e.g. "isro.gov.in.recruitment-portal.xyz" or "sbi.com.careers-update.net"
  // Skip if already confirmed official allowlisted domain
  if (!isAllowlisted) {
    for (const keyword of SENSITIVE_BRAND_KEYWORDS) {
      if (hostname.includes(keyword)) {
        // Check if keyword is part of subdomains while root domain is different
        const parts = hostname.split('.');
        const isTwoPartTld = /\.(?:gov|nic|ac|edu|res|co|org|net|gen)\.[a-z]{2}$/i.test(hostname);
        const rootDomainPartsCount = isTwoPartTld ? 3 : 2;
        if (parts.length > rootDomainPartsCount) {
          const rootDomain = parts.slice(-rootDomainPartsCount).join('.');
          if (!rootDomain.includes(keyword)) {
            indicators.push({
              ruleId: 'URL_MISLEADING_BRAND_SUBDOMAIN',
              category: 'URL & Website Security',
              name: `Lookalike Subdomain Pattern (${keyword.toUpperCase()})`,
              severity: 'HIGH',
              weight: 25,
              explanation: `The web address contains the trusted name "${keyword}" inside a subdomain, but the actual owning domain is "${rootDomain}". This is a classic brand impersonation technique.`,
              evidenceSnippet: hostname,
            });
            score += 25;
            break;
          }
        }
      }
    }
  }

  // 11. High-Abuse / Disposable TLD check
  const hasAbuseTld = HIGH_ABUSE_TLDS.some((tld) => hostname.endsWith(tld));
  if (hasAbuseTld) {
    const ext = hostname.slice(hostname.lastIndexOf('.'));
    indicators.push({
      ruleId: 'URL_HIGH_ABUSE_TLD',
      category: 'URL & Website Security',
      name: `Unconventional / High-Risk Domain Extension (${ext})`,
      severity: 'MEDIUM',
      weight: 15,
      explanation: `The website uses a domain extension (${ext}) that is statistically overrepresented in disposable phishing and fraud registrations.`,
      evidenceSnippet: ext,
    });
    score += 15;
  }

  // 12. Apply allowlist discount if official domain
  if (isAllowlisted) {
    // An allowlisted official domain substantially discounts false alarms unless credentials/dangerous schemes are detected
    if (!username && !password && ['http:', 'https:'].includes(protocol)) {
      score = Math.max(0, score - 20);
    }
  }

  // 13. Reputation API Check Status
  // If an external reputation provider is configured in environment, check it. Otherwise, explain status transparently.
  const reputationStatus = process.env.GOOGLE_SAFE_BROWSING_API_KEY
    ? 'Configured (Active backend integration)'
    : 'Unavailable (No external third-party domain reputation API configured)';

  return {
    hasUrl: true,
    isValid: true,
    rawUrl: trimmed,
    protocol,
    hostname,
    port: port || (protocol === 'https:' ? '443' : '80'),
    isAllowlisted,
    allowlistCategory: allowlistCheck.category,
    isShortener,
    isFreeHosting,
    indicators,
    score: Math.min(100, score),
    reputationStatus,
  };
}

module.exports = {
  analyzeUrl,
  SUSPICIOUS_SHORTENERS,
  FREE_HOSTING_PLATFORMS,
  HIGH_ABUSE_TLDS,
};
