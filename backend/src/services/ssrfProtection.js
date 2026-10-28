const { URL } = require("url");
const net = require("net");

/**
 * Validates whether a target URL is safe from SSRF attacks.
 * Disallows:
 * - Non-HTTP/HTTPS protocols (e.g. file:, ftp:, gopher:)
 * - Localhost, loopback (127.0.0.1, ::1)
 * - Private IPv4 blocks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 link-local)
 * - Broadcast / 0.0.0.0
 * - Internal domain naming (e.g. *.internal, *.local, localhost)
 */

function isPrivateIp(ip) {
  if (!net.isIP(ip)) return false;

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    // 127.0.0.0/8 (loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (private 172.16.0.0 - 172.31.255.255)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    return false;
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    // ::1 loopback
    if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;
    // unique local fe80:: / fc00::
    const lower = ip.toLowerCase();
    if (
      lower.startsWith("fe80") ||
      lower.startsWith("fc") ||
      lower.startsWith("fd")
    )
      return true;
    return false;
  }

  return false;
}

function validateUrlSafety(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return {
      isSafe: false,
      reason: "URL string is required and must be valid text.",
    };
  }

  // Length check
  if (urlString.length > 2048) {
    return {
      isSafe: false,
      reason: "URL exceeds maximum allowable length of 2048 characters.",
    };
  }

  let parsed;
  try {
    parsed = new URL(urlString.trim());
  } catch (err) {
    return {
      isSafe: false,
      reason:
        "Malformed URL syntax. Must include valid protocol (e.g., https://).",
    };
  }

  // Check protocol
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      isSafe: false,
      reason: `Disallowed protocol "${parsed.protocol}". Only standard http: and https: protocols are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check for localhost / loopback names
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan")
  ) {
    return {
      isSafe: false,
      reason: `Restricted hostname "${hostname}". Internal and localhost addresses are prohibited.`,
    };
  }

  // Check if direct IP address is private
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return {
        isSafe: false,
        reason: `Restricted IP destination (${hostname}). Private and loopback IP spaces are blocked.`,
      };
    }
  }

  return {
    isSafe: true,
    hostname,
    protocol: parsed.protocol,
    pathname: parsed.pathname,
    cleanUrl: parsed.toString(),
  };
}

module.exports = {
  validateUrlSafety,
  isPrivateIp,
};
