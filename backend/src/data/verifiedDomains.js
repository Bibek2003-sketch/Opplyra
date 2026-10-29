/**
 * Opplyra Verified Official Domain Allowlist
 * Version: 1.0.0
 * 
 * Explicit allowlist of vetted domains and high-assurance country-code / academic suffixes.
 * Kept strictly separate from general scam detection patterns.
 * 
 * Note: Presence on this allowlist indicates the domain belongs to a recognized
 * organization or approved TLD namespace (.gov.in, .nic.in). It does NOT automatically
 * vouch for external links or unverified subdomains on public hosting platforms.
 */

// High-assurance official top-level / second-level domain suffixes in India
const OFFICIAL_GOVERNMENT_SUFFIXES = [
  '.gov.in',
  '.nic.in',
  '.res.in',
];

// High-assurance university and educational research domain suffixes
const OFFICIAL_ACADEMIC_SUFFIXES = [
  '.ac.in',
  '.edu',
  '.edu.in',
];

// Explicitly reviewed and verified organization root domains
const VERIFIED_ORGANIZATION_DOMAINS = [
  // Government & Statutory Testing Portals
  'scholarships.gov.in',
  'isro.gov.in',
  'drdo.gov.in',
  'upsc.gov.in',
  'upsconline.nic.in',
  'ssc.nic.in',
  'ssc.gov.in',
  'rbi.org.in',
  'opportunities.rbi.org.in',
  'indianrailways.gov.in',
  'rrbcdg.gov.in',
  'skillindiadigital.gov.in',
  'nsdcindia.org',
  'gate2025.iitr.ac.in',
  'cybercrime.gov.in',

  // Corporate Career Portals
  'research.google',
  'google.com',
  'careers.google.com',
  'careers.microsoft.com',
  'microsoft.com',
  'tcs.com',
  'nextstep.tcs.com',
  'infosys.com',
  'wipro.com',
  'anitab.org',
  'ghc.anitab.org',
];

/**
 * Checks whether a hostname matches the verified official allowlist.
 */
function isVerifiedOfficialDomain(hostname) {
  if (!hostname || typeof hostname !== 'string') return false;
  const host = hostname.toLowerCase().trim();

  // 1. Direct match on reviewed domain or subdomain
  for (const verified of VERIFIED_ORGANIZATION_DOMAINS) {
    if (host === verified || host.endsWith('.' + verified)) {
      return {
        isOfficial: true,
        matchedDomain: verified,
        category: 'Vetted Organization / Portal',
      };
    }
  }

  // 2. Official Government namespace (.gov.in, .nic.in)
  for (const suffix of OFFICIAL_GOVERNMENT_SUFFIXES) {
    if (host.endsWith(suffix)) {
      return {
        isOfficial: true,
        matchedDomain: suffix,
        category: 'Indian Government (.gov.in / .nic.in)',
      };
    }
  }

  // 3. Official Academic namespace (.ac.in, .edu.in, .edu)
  for (const suffix of OFFICIAL_ACADEMIC_SUFFIXES) {
    if (host.endsWith(suffix)) {
      return {
        isOfficial: true,
        matchedDomain: suffix,
        category: 'Recognized Academic / University Namespace',
      };
    }
  }

  return {
    isOfficial: false,
    matchedDomain: null,
    category: null,
  };
}

module.exports = {
  OFFICIAL_GOVERNMENT_SUFFIXES,
  OFFICIAL_ACADEMIC_SUFFIXES,
  VERIFIED_ORGANIZATION_DOMAINS,
  isVerifiedOfficialDomain,
};

