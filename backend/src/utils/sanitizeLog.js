/**
 * Security Utility: Sanitize and redact MongoDB credentials from terminal output and logs.
 * Ensures MongoDB passwords in connection strings from .env or elsewhere are NEVER
 * exposed in terminal stdout/stderr or internal loggers.
 */

function extractMongoPassword(uri) {
  if (!uri || typeof uri !== 'string') return null;
  const match = uri.match(/mongodb(?:\+srv)?:\/\/[^:]+:([^@]+)@/i);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Mask passwords in any MongoDB connection string or text containing a MongoDB URI
 * e.g. "mongodb+srv://admin:mySecretPass@cluster0..." -> "mongodb+srv://admin:******@cluster0..."
 */
function maskMongoUri(text) {
  if (text === null || text === undefined) return text;
  let str = typeof text === 'string' ? text : (text.message || String(text));

  // 1. Mask URI credentials with format: mongodb(+srv)://user:password@host
  str = str.replace(/(mongodb(?:\+srv)?:\/\/)([^:@\s]+):([^@\s]+)@/gi, '$1$2:******@');

  // 2. Mask URI credentials with format: mongodb(+srv)://:password@host
  str = str.replace(/(mongodb(?:\+srv)?:\/\/):([^@\s]+)@/gi, '$1:******@');

  // 3. Scrub raw configured password from .env if present
  const envUri = process.env.MONGODB_URI;
  if (envUri) {
    const rawMatch = envUri.match(/mongodb(?:\+srv)?:\/\/[^:]+:([^@]+)@/i);
    if (rawMatch && rawMatch[1] && rawMatch[1].length >= 3) {
      const rawSecret = rawMatch[1];
      str = str.split(rawSecret).join('******');
      try {
        const decodedSecret = decodeURIComponent(rawSecret);
        if (decodedSecret && decodedSecret.length >= 3) {
          str = str.split(decodedSecret).join('******');
        }
      } catch {
        // ignore
      }
    }
  }

  return str;
}

/**
 * Scrub stream chunk (string or Buffer)
 */
function scrubChunk(chunk, encoding) {
  if (Buffer.isBuffer(chunk)) {
    const enc = typeof encoding === 'string' ? encoding : 'utf8';
    const text = chunk.toString(enc);
    const scrubbed = maskMongoUri(text);
    return scrubbed !== text ? Buffer.from(scrubbed, enc) : chunk;
  }
  if (typeof chunk === 'string') {
    return maskMongoUri(chunk);
  }
  return chunk;
}

/**
 * Install transparent stream scrubber on process.stdout and process.stderr
 * to guarantee zero password leakage from any console or third-party logger.
 */
let isInstalled = false;

function installTerminalScrubber() {
  if (isInstalled) return;
  isInstalled = true;

  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = function (chunk, encoding, callback) {
    const scrubbed = scrubChunk(chunk, encoding);
    return origStdoutWrite(scrubbed, encoding, callback);
  };

  process.stderr.write = function (chunk, encoding, callback) {
    const scrubbed = scrubChunk(chunk, encoding);
    return origStderrWrite(scrubbed, encoding, callback);
  };
}

// Auto-activate output protection upon module import
installTerminalScrubber();

module.exports = {
  maskMongoUri,
  extractMongoPassword,
  installTerminalScrubber,
  scrubChunk,
};
