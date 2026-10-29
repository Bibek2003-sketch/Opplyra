/**
 * Opplyra Message Analysis Engine
 * 
 * Safely normalizes text, evaluates contextual multi-signal rules across fraud categories,
 * recognizes educational advisories and anti-fraud negation disclaimers, and produces
 * explainable evidence-grounded indicators with transparent risk scoring.
 */

const {
  PATTERNS,
  BENIGN_NEGATION_PATTERNS,
  BENIGN_AWARENESS_PATTERNS
} = require('../data/fraudPatterns');

/**
 * Normalizes text safely:
 * - Normalizes Unicode NFKC
 * - Strips zero-width characters commonly used in keyword-filter evasion
 * - Standardises dashes, currency symbols, and quotes
 * - Collapses multi-spaces and tabs while preserving paragraph structure
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Strip zero-width evasion characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Standardize unicode NFKC
    .normalize('NFKC')
    // Standardize dashes/hyphens
    .replace(/[–—−]/g, '-')
    // Standardize smart quotes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // Collapse multi-spaces and tabs
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Evaluates whether text contains explicit anti-fraud disclaimers or negation phrases.
 */
function detectNegationDisclaimers(text) {
  const disclaimers = [];
  for (const pattern of BENIGN_NEGATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      disclaimers.push({
        matchedSnippet: match[0],
        pattern: pattern.toString(),
      });
    }
  }
  return disclaimers;
}

/**
 * Evaluates whether text is an educational advisory, safety bulletin, or guide on how to spot scams.
 */
function detectEducationalAdvisory(text) {
  for (const pattern of BENIGN_AWARENESS_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        isAdvisory: true,
        matchedSnippet: match[0],
      };
    }
  }
  return { isAdvisory: false, matchedSnippet: null };
}

/**
 * Analyzes announcement text against curated fraud rules with contextual awareness.
 */
function analyzeMessage(rawText) {
  const cleanText = normalizeText(rawText);

  if (!cleanText || cleanText.length < 15) {
    return {
      hasText: Boolean(cleanText),
      textLength: cleanText.length,
      indicators: [],
      score: 0,
      negationDisclaimers: [],
      isEducationalAdvisory: false,
    };
  }

  const indicators = [];
  const matchedCategories = new Set();
  let score = 0;

  // 1. Detect genuine warning / anti-fraud disclaimers (e.g. "We never ask for fees")
  const disclaimers = detectNegationDisclaimers(cleanText);
  const hasAntiFraudDisclaimer = disclaimers.length > 0;

  // 2. Detect educational discussion context (e.g. "How to spot scholarship scams: Scammers often demand...")
  const advisoryCheck = detectEducationalAdvisory(cleanText);
  const isEducationalAdvisory = advisoryCheck.isAdvisory;

  // 3. Evaluate against all curated pattern rules
  for (const patternDef of PATTERNS) {
    const match = cleanText.match(patternDef.regex);
    if (match) {
      const matchIndex = match.index;
      const snippet = match[0];

      // Extract surrounding context (120 chars before and after)
      const start = Math.max(0, matchIndex - 120);
      const end = Math.min(cleanText.length, matchIndex + snippet.length + 120);
      const surroundingClause = cleanText.substring(start, end).toLowerCase();

      // Check if this specific mention is negated or part of an educational discussion
      const isLocallyNegated = /(?:do\s*not|never|no|beware\s*of|warning|prohibited|caution|fake\s*agents?|scammers?\s*(?:often|typically|usually)|tactics?\s*include|common\s*(?:scams?|frauds?)).{0,75}(?:pay|send|charge|collect|ask|share|fee|guarantee|selection|money|deposit|otp|password|pin)/i.test(surroundingClause);

      if ((isLocallyNegated && hasAntiFraudDisclaimer) || isEducationalAdvisory) {
        // Legitimate notice explicitly warning students not to fall for scams or educational article
        continue;
      }

      indicators.push({
        ruleId: patternDef.id,
        name: patternDef.name,
        category: patternDef.category,
        severity: patternDef.severity,
        weight: patternDef.weight,
        explanation: patternDef.explanation,
        recommendedAction: patternDef.action,
        evidenceSnippet: snippet,
      });

      matchedCategories.add(patternDef.category);
      score += patternDef.weight;
    }
  }

  // Score moderation for notices that contain explicit anti-fraud disclaimers
  if (hasAntiFraudDisclaimer && indicators.length > 0) {
    score = Math.max(0, score - 20);
  }

  return {
    hasText: true,
    textLength: cleanText.length,
    indicators,
    score: Math.min(100, score),
    categoryCount: matchedCategories.size,
    negationDisclaimers: disclaimers,
    isEducationalAdvisory,
  };
}

module.exports = {
  normalizeText,
  detectNegationDisclaimers,
  detectEducationalAdvisory,
  analyzeMessage,
};
