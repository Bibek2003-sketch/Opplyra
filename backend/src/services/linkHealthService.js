const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const { URL } = require('url');

/**
 * Checks if an IP address falls within private, loopback, link-local, or reserved ranges
 */
function isPrivateOrReservedIp(ip) {
  if (!ip) return true;

  // Normalize IPv6 mapped IPv4 (e.g. ::ffff:127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv6 loopback / local
  if (ip === '::1' || ip === '::' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
    return true;
  }

  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) {
    return false;
  }

  const [b1, b2, b3, b4] = parts;

  // 0.0.0.0/8 (Broadcast/This network)
  if (b1 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (b1 === 127) return true;

  // 10.0.0.0/8 (Private Network)
  if (b1 === 10) return true;

  // 172.16.0.0/12 (Private Network: 172.16.0.0 - 172.31.255.255)
  if (b1 === 172 && b2 >= 16 && b2 <= 31) return true;

  // 192.168.0.0/16 (Private Network)
  if (b1 === 192 && b2 === 168) return true;

  // 169.254.0.0/16 (Link-local / Cloud Metadata 169.254.169.254)
  if (b1 === 169 && b2 === 254) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (b1 === 100 && b2 >= 64 && b2 <= 127) return true;

  // 224.0.0.0/4 (Multicast) or 255.255.255.255 (Broadcast)
  if (b1 >= 224) return true;

  return false;
}

/**
 * Strict URL format and protocol validation
 */
function validateUrlFormat(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, reason: 'URL is required and must be a string' };
  }

  const trimmed = urlString.trim();
  if (trimmed.length < 8 || trimmed.length > 2048) {
    return { valid: false, reason: 'URL length is invalid' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'Malformed URL format' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTP and HTTPS protocols are permitted' };
  }

  if (!parsed.hostname || parsed.hostname.length === 0) {
    return { valid: false, reason: 'Hostname is missing' };
  }

  // Reject credentials in URL (e.g. https://user:pass@example.com)
  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'URLs containing credentials are not permitted' };
  }

  return { valid: true, url: trimmed, parsed };
}

/**
 * Validates hostname against SSRF attacks (checks literal IPs & performs DNS lookup)
 */
async function validateSsrfTarget(hostname) {
  const host = hostname.toLowerCase().trim();

  // Literal local/private names
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost')
  ) {
    return { safe: false, reason: 'Target hostname is a local or internal address' };
  }

  // If host is already an IP address
  if (isPrivateOrReservedIp(host)) {
    return { safe: false, reason: 'Target IP is in a private or reserved range' };
  }

  // DNS lookup to verify resolved IP is safe
  try {
    const lookupResult = await dns.lookup(host, { all: true });
    for (const record of lookupResult) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          safe: false,
          reason: `Resolved IP address (${record.address}) is in a private or restricted range`,
        };
      }
    }
  } catch (dnsErr) {
    return { safe: false, reason: `DNS resolution failed: ${dnsErr.message}` };
  }

  return { safe: true };
}

/**
 * Checks URL reachability and classifies the response
 */
async function checkUrlReachability(urlString, maxRedirects = 3) {
  const formatCheck = validateUrlFormat(urlString);
  if (!formatCheck.valid) {
    return {
      status: 'invalid_url',
      isAvailable: false,
      message: 'The application link for this opportunity is missing or invalid.',
      detail: formatCheck.reason,
    };
  }

  let currentUrl = formatCheck.url;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    let parsed;
    try {
      parsed = new URL(currentUrl);
    } catch {
      return {
        status: 'redirect_problem',
        isAvailable: false,
        message: 'The website redirected to an invalid URL destination.',
      };
    }

    const ssrfCheck = await validateSsrfTarget(parsed.hostname);
    if (!ssrfCheck.safe) {
      return {
        status: 'access_restricted',
        isAvailable: false,
        message: 'Access to this destination address is restricted.',
        detail: ssrfCheck.reason,
      };
    }

    try {
      const result = await makeSafeRequest(currentUrl);

      // Handle redirect
      if ([301, 302, 303, 307, 308].includes(result.statusCode)) {
        const redirectLocation = result.headers.location;
        if (!redirectLocation) {
          return {
            status: 'redirect_problem',
            isAvailable: false,
            message: 'Website returned a redirect without a destination location.',
          };
        }

        // Resolve relative redirects safely
        currentUrl = new URL(redirectLocation, currentUrl).toString();
        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          return {
            status: 'redirect_problem',
            isAvailable: false,
            message: 'Website exceeded maximum permitted redirect attempts.',
          };
        }
        continue;
      }

      // Classify HTTP Status Codes
      if (result.statusCode >= 200 && result.statusCode < 400) {
        return {
          status: 'available',
          statusCode: result.statusCode,
          isAvailable: true,
          message: 'Official website is accessible.',
        };
      }

      if (result.statusCode === 404 || result.statusCode === 410) {
        return {
          status: 'not_found',
          statusCode: result.statusCode,
          isAvailable: false,
          message:
            "The official website returned a 'Page Not Found' response. The application link may have changed or expired.",
        };
      }

      if (result.statusCode === 401 || result.statusCode === 403) {
        // Government and enterprise portals often block automated scrapers/bots with 403,
        // but students can open them directly in regular web browsers!
        return {
          status: 'access_restricted',
          statusCode: result.statusCode,
          isAvailable: true,
          message:
            'This website may require you to sign in or may restrict access. Open the official website and follow its instructions to continue.',
        };
      }

      if (result.statusCode >= 500) {
        return {
          status: 'unavailable',
          statusCode: result.statusCode,
          isAvailable: false,
          message:
            'The official website is not responding right now. This may be a temporary problem with the external website.',
        };
      }

      return {
        status: 'unknown_failure',
        statusCode: result.statusCode,
        isAvailable: false,
        message: "We couldn't confirm that the application website is available.",
      };
    } catch (err) {
      if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT' || err.message === 'REQUEST_TIMEOUT') {
        return {
          status: 'unavailable',
          isAvailable: false,
          message: 'The official website connection timed out. Please try again later.',
        };
      }
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        return {
          status: 'network_problem',
          isAvailable: false,
          message: 'Unable to reach the official website. This may be a network or DNS issue.',
        };
      }
      return {
        status: 'unknown_failure',
        isAvailable: false,
        message: "We couldn't confirm that the application website is available. Please try again later.",
      };
    }
  }

  return {
    status: 'redirect_problem',
    isAvailable: false,
    message: 'The website redirected too many times.',
  };
}

/**
 * Dispatches an HTTP HEAD or bounded GET request with safety timeouts
 */
function makeSafeRequest(targetUrl, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const lib = parsed.protocol === 'https:' ? https : http;

    const reqOptions = {
      method: 'GET',
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: `${parsed.pathname || '/'}${parsed.search || ''}`,
      headers: {
        'User-Agent': 'Opplyra-Link-Verification-Bot/1.0 (+https://opplyra.app/verification)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: timeoutMs,
    };

    let settled = false;
    const req = lib.request(reqOptions, (res) => {
      settled = true;
      // Abort body downloading since we only need the HTTP status and headers
      res.destroy();
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
      });
    });

    req.on('timeout', () => {
      if (!settled) {
        settled = true;
        req.destroy();
        reject(new Error('REQUEST_TIMEOUT'));
      }
    });

    req.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    req.end();
  });
}

module.exports = {
  validateUrlFormat,
  validateSsrfTarget,
  checkUrlReachability,
  isPrivateOrReservedIp,
};

