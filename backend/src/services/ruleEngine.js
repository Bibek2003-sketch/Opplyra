/**
 * Opplyra Verification Rule Engine
 * 
 * Inspects submitted opportunity text and URL for common warning signs.
 * Strictly rule-based, deterministic, and evidence-grounded.
 * Never outputs synthetic trust percentages or guarantees genuineness.
 */

const { validateUrlSafety } = require('./ssrfProtection');

// Known legitimate domains for reputable organizations
const KNOWN_ORGANIZATION_DOMAINS = {
  upsc: ['upsc.gov.in', 'upsconline.nic.in'],
  ssc: ['ssc.nic.in', 'ssc.gov.in'],
  railways: ['indianrailways.gov.in', 'rrbcdg.gov.in', 'indianrail.gov.in'],
  isro: ['isro.gov.in'],
  drdo: ['drdo.gov.in'],
  rbi: ['rbi.org.in', 'opportunities.rbi.org.in'],
  google: ['google.com', 'careers.google.com'],
  microsoft: ['microsoft.com', 'careers.microsoft.com'],
  tcs: ['tcs.com', 'nextstep.tcs.com'],
  infosys: ['infosys.com'],
  wipro: ['wipro.com']
};

const SUSPICIOUS_FREE_HOSTS = [
  'blogspot.com',
  'wordpress.com',
  'wixsite.com',
  'weebly.com',
  'sites.google.com',
  'formsite.com',
  'typeform.com',
  'tinyurl.com',
  'bit.ly',
  'cutt.ly',
  'is.gd',
  't.ly'
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.buzz', '.club', '.work', '.loan', '.click', '.gq', '.cf', '.tk', '.ml'];

// Deterministic Rule Definitions
const RULES = [
  {
    id: 'R1_UPFRONT_PAYMENT_DEMAND',
    name: 'Asks for Upfront Payment or Fee Deposit',
    category: 'Money and Payment Risk',
    severity: 'HIGH',
    explanation: 'Real employers, government boards, and scholarship programs never ask candidates to pay for job offers, training fees, or equipment deposits.',
    patterns: [
      /(?:security\s*deposit|caution\s*deposit|refundable\s*deposit|refundable\s*fee|registration\s*fee\s*of\s*(?:rs\.?|inr|₹)?\s*\d+)/i,
      /(?:send|pay|transfer)\s*(?:money|amount|fees?)\s*(?:via|through|to)\s*(?:upi|google\s*pay|gpay|phonepe|paytm|scanner|qr\s*code|crypto|bitcoin|usdt)/i,
      /(?:laptop\s*charges|documentation\s*charges|courier\s*fee|id\s*card\s*fee|uniform\s*fee|kit\s*fee)/i,
      /(?:pay\s*(?:rs\.?|inr|₹)?\s*\d+\s*(?:to\s*confirm|before\s*joining|for\s*interview|for\s*offer\s*letter))/i
    ]
  },
  {
    id: 'R2_UNREALISTIC_GUARANTEE',
    name: 'Unrealistic Guarantee of Selection',
    category: 'False Promises',
    severity: 'HIGH',
    explanation: 'Legitimate organizations never promise 100% selection or direct appointment without a proper selection process.',
    patterns: [
      /(?:100%|guaranteed)\s*(?:selection|placement|job|appointment|selection\s*guarantee|joining)/i,
      /(?:direct\s*joining|direct\s*selection)\s*(?:without\s*(?:any\s*)?(?:exam|interview|test|written\s*test))/i,
      /(?:instant|immediate)\s*(?:appointment\s*letter|offer\s*letter\s*in\s*24\s*hours?)/i,
      /(?:earn\s*(?:rs\.?|inr|₹)?\s*\d+[\d,]*\s*(?:daily|per\s*day|hourly)\s*(?:from\s*home|without\s*qualification|without\s*skills?))/i,
      /(?:no\s*interview\s*needed|no\s*qualification\s*required|everyone\s*selected)/i
    ]
  },
  {
    id: 'R3_SUSPICIOUS_URGENCY',
    name: 'Urgent or High-Pressure Language',
    category: 'Artificial Pressure',
    severity: 'MEDIUM',
    explanation: 'Scams often pressure you to act within a few hours or pay immediately before you have time to check with your family or college.',
    patterns: [
      /(?:within\s*(?:1|2|3|4|6|12|24)\s*hours?|before\s*(?:midnight|today|5\s*pm))\s*(?:or|otherwise)\s*(?:seat\s*cancelled|offer\s*withdrawn|disqualified)/i,
      /(?:only\s*(?:2|3|4|5|10)\s*seats?\s*(?:left|remaining|available)\s*(?:hurry|rush))/i,
      /(?:strictly\s*confidential|do\s*not\s*disclose\s*to\s*(?:college|parents|friends))/i,
      /(?:act\s*immediately|last\s*and\s*final\s*warning|legal\s*action\s*if\s*not\s*reported)/i
    ]
  },
  {
    id: 'R4_UNOFFICIAL_COMMUNICATION_CHANNEL',
    name: 'Unofficial Contact Channel',
    category: 'Impersonation Risk',
    severity: 'HIGH',
    explanation: 'Official hiring teams communicate through official work email addresses, not personal WhatsApp numbers, Telegram links, or free webmail accounts.',
    patterns: [
      /(?:contact|message|reach\s*out|whatsapp)\s*(?:us|hr|recruiter|coordinator)?\s*(?:only\s*)?(?:on|at|via)\s*whatsapp\s*(?::|\s)\s*(?:\+91|91|0)?[6-9]\d{9}/i,
      /(?:join|click)\s*(?:our|the)?\s*telegram\s*(?:group|channel|link)\s*(?:to\s*apply|for\s*appointment|for\s*question\s*paper)/i,
      /[a-zA-Z0-9._%+-]+@(?:gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|rediffmail\.com)\s*(?:for\s*(?:official|government|tcs|infosys|wipro|isro|railway)\s*(?:job|recruitment|queries))/i
    ]
  },
  {
    id: 'R5_IMPERSONATION_FREE_HOSTING',
    name: 'Official Notice on a Free Website Platform',
    category: 'Website Address Mismatch',
    severity: 'HIGH',
    explanation: 'This announcement claims to be from a government or major company, but uses a free website builder instead of an official domain.',
    patterns: []
  }
];

function analyzeAnnouncement({ text = '', url = '' }) {
  const trimmedText = (text || '').trim();
  const trimmedUrl = (url || '').trim();

  // If both are empty or combined length is trivially short
  if (trimmedText.length < 25 && !trimmedUrl) {
    return {
      status: 'Not Enough Information',
      classification: 'INCONCLUSIVE',
      summary: 'Please provide at least 25 characters of notice text or a website link so we can check it.',
      indicatorsDetected: [],
      rulesCheckedCount: RULES.length,
      unverifiedAspects: [
        'Whether the person or group behind this notice is real and verified',
        'Whether any fees will be asked for in private phone calls or messages later',
        'Whether this notice was officially approved by the named organization'
      ],
      recommendedSteps: [
        'Find the full notification or official announcement document.',
        'Paste the complete text including contact details and instructions.',
        'Check the organization\'s official careers portal directly.'
      ],
      submittedUrl: trimmedUrl || null,
      analyzedAt: new Date().toISOString()
    };
  }

  const indicatorsDetected = [];

  // 1. Text-based regex rule evaluations
  for (const rule of RULES) {
    if (rule.patterns.length > 0) {
      for (const pattern of rule.patterns) {
        const match = trimmedText.match(pattern);
        if (match) {
          indicatorsDetected.push({
            ruleId: rule.id,
            name: rule.name,
            category: rule.category,
            severity: rule.severity,
            explanation: rule.explanation,
            evidenceSnippet: match[0],
            matchedPattern: pattern.toString()
          });
          break;
        }
      }
    }
  }

  // 2. URL & Domain Mismatch Evaluation
  let urlValidationResult = null;
  if (trimmedUrl) {
    urlValidationResult = validateUrlSafety(trimmedUrl);
    if (!urlValidationResult.isSafe) {
      indicatorsDetected.push({
        ruleId: 'R0_UNSAFE_OR_RESTRICTED_URL',
        name: 'Unsafe or Blocked Web Address',
        category: 'Link Safety',
        severity: 'HIGH',
        explanation: 'This web address cannot be safely checked because it points to an internal or restricted network address.',
        evidenceSnippet: trimmedUrl,
        technicalDetail: urlValidationResult.reason
      });
    } else {
      const hostname = urlValidationResult.hostname;
      
      const isFreeHost = SUSPICIOUS_FREE_HOSTS.some(host => hostname.includes(host));
      const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));

      const claimsGov = /(?:upsc|ssc|railway|isro|drdo|rbi|ministry|sarkari|government\s*of\s*india|pradhan\s*mantri)/i.test(trimmedText + ' ' + hostname);
      const claimsTopTech = /(?:google|microsoft|tcs|infosys|amazon|meta)/i.test(trimmedText);

      if (isFreeHost && (claimsGov || claimsTopTech)) {
        indicatorsDetected.push({
          ruleId: 'R5_IMPERSONATION_FREE_HOSTING',
          name: 'Official Notice on a Free Website Platform',
          category: 'Website Address Mismatch',
          severity: 'HIGH',
          explanation: `The announcement claims to be from ${claimsGov ? 'a government body' : 'a major technology company'} but uses a free website builder (${hostname}). Real organizations always use official verified websites.`,
          evidenceSnippet: `Claims to be official while using ${hostname}`
        });
      } else if (claimsGov && !hostname.endsWith('.gov.in') && !hostname.endsWith('.nic.in') && !hostname.includes('localhost')) {
        indicatorsDetected.push({
          ruleId: 'R6_GOVERNMENT_IMPERSONATION_DOMAIN',
          name: 'Government Notice on Unofficial Website',
          category: 'Website Address Mismatch',
          severity: 'HIGH',
          explanation: 'Official Indian government recruitment websites end with .gov.in or .nic.in. Commercial websites (.com, .net, .xyz, etc.) claiming to be official government portals are often fraudulent.',
          evidenceSnippet: `Website address "${hostname}" does not end with .gov.in or .nic.in`
        });
      } else if (hasSuspiciousTld) {
        indicatorsDetected.push({
          ruleId: 'R7_UNCONVENTIONAL_TLD',
          name: 'Unusual Website Extension',
          category: 'Website Reputation',
          severity: 'MEDIUM',
          explanation: `This link uses an unusual domain extension (${hostname.slice(hostname.lastIndexOf('.'))}) that is frequently used by temporary scam websites.`,
          evidenceSnippet: hostname
        });
      }
    }
  }

  // 3. Free email used for official jobs detected in plain text
  const emailMatch = trimmedText.match(/[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|rediffmail\.com)/i);
  if (emailMatch && /(?:tcs|infosys|wipro|google|microsoft|isro|upsc|railway|official|hr|recruitment)/i.test(trimmedText)) {
    const alreadyAdded = indicatorsDetected.some(i => i.ruleId === 'R4_UNOFFICIAL_COMMUNICATION_CHANNEL');
    if (!alreadyAdded) {
      indicatorsDetected.push({
        ruleId: 'R4_UNOFFICIAL_COMMUNICATION_CHANNEL',
        name: 'Official Notice Using a Personal Email Address',
        category: 'Impersonation Risk',
        severity: 'HIGH',
        explanation: `This message asks you to apply using a free personal email address (${emailMatch[0]}). Official recruitment teams only use verified company or institution email addresses.`,
        evidenceSnippet: emailMatch[0]
      });
    }
  }

  // Determine Category Classification
  let classification = 'NO_INDICATORS_DETECTED';
  let status = 'No common warning signs were found';
  let summary = 'We did not find any of our configured warning signs in this message or link. However, this does not guarantee the opportunity is genuine. Always double-check on the official website.';

  if (indicatorsDetected.length > 0) {
    classification = 'WARNING_INDICATORS_DETECTED';
    status = 'Warning signs detected';
    const highCount = indicatorsDetected.filter(i => i.severity === 'HIGH').length;
    summary = `We found ${indicatorsDetected.length} warning sign(s) in this announcement, including ${highCount} major red flag(s). Be very cautious before sharing personal documents or sending any money.`;
  }

  // What remains unknown
  const unverifiedAspects = [
    'Whether the person or group contacting you actually works for the organization.',
    'Whether this announcement was copied or forwarded by an unauthorized agent or middleman.',
    'Whether any fees will be requested in private phone calls or follow-up messages.'
  ];

  // Recommended verification steps
  const recommendedSteps = [
    'Visit the organization\'s official website directly and check their careers or notices page.',
    'Never pay for job applications, interview registration, or "refundable caution deposits" — bona fide employers do not charge applicants.',
    'Check with your college Training & Placement Office (TPO) or student advisors before applying.',
    'If someone tries to scam you, report the incident on the National Cyber Crime Portal (cybercrime.gov.in).'
  ];

  return {
    status,
    classification,
    summary,
    indicatorsDetected,
    rulesCheckedCount: RULES.length + 3,
    unverifiedAspects,
    recommendedSteps,
    submittedUrl: trimmedUrl || null,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  analyzeAnnouncement,
  RULES
};
