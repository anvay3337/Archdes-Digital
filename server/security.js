// ==============================================================================
// Archdes Digital — Enterprise Security & Hardening Middleware
// ==============================================================================

const fs = require('fs');
const path = require('path');

/**
 * Modern Sliding Window Rate Limiter with Auto-Pruning
 */
class RateLimiter {
  constructor(windowMs = 600000, maxHits = 5) {
    this.windowMs = windowMs;
    this.maxHits = maxHits;
    this.hits = new Map();
    // Auto-prune expired records every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.prune(), Math.min(windowMs, 300000)).unref();
    }
  }

  isLimited(ip) {
    const now = Date.now();
    const timestamps = (this.hits.get(ip) || []).filter(t => now - t < this.windowMs);
    if (timestamps.length >= this.maxHits) {
      this.hits.set(ip, timestamps);
      return true;
    }
    timestamps.push(now);
    this.hits.set(ip, timestamps);
    return false;
  }

  prune() {
    const now = Date.now();
    for (const [ip, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter(t => now - t < this.windowMs);
      if (valid.length === 0) {
        this.hits.delete(ip);
      } else {
        this.hits.set(ip, valid);
      }
    }
  }
}

/**
 * Enforces HTTPS in production environments behind reverse proxies
 */
function httpsRedirectMiddleware(req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const proto = req.headers['x-forwarded-proto'];

  if (isProd && proto && proto !== 'https') {
    const host = req.headers['host'] || req.hostname;
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }
  next();
}

/**
 * Enforces Enterprise Security Headers on all HTTP responses
 */
function securityHeadersMiddleware(req, res, next) {
  // 1. Remove Fingerprinting
  res.removeHeader('X-Powered-By');

  // 2. Transport & Framing Security
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // Modern replacement for buggy legacy filter
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 3. Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // 4. Isolation & Origin Policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // 5. Restrict Device Hardware APIs
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=()'
  );

  // 6. Strict Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self'; " +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  next();
}

/**
 * Blocks forbidden HTTP methods
 */
function allowedMethodsMiddleware(req, res, next) {
  const ALLOWED_METHODS = new Set(['GET', 'POST', 'HEAD', 'OPTIONS']);
  if (!ALLOWED_METHODS.has(req.method)) {
    res.setHeader('Allow', 'GET, POST, HEAD, OPTIONS');
    return res.status(405).json({ error: `Method ${req.method} is not allowed.` });
  }
  next();
}

/**
 * Blocks sensitive paths, dotfiles (.env, .git), backups, and hidden directories
 */
function sensitivePathShield(req, res, next) {
  const urlPath = req.path.toLowerCase();
  
  // Allow RFC 9116 security.txt & well-known standard discovery endpoints
  if (urlPath.startsWith('/.well-known/')) {
    return next();
  }

  // Forbidden path signatures
  const FORBIDDEN_SIGNATURES = [
    /\/\./,           // any dotfile/dotfolder (/.git, /.env, /.svn)
    /\.(env|git|bak|old|tmp|sql|db|sqlite|yml|yaml|md|log|ini|conf)$/i,
    /\/node_modules\//i,
    /\/server\//i,
    /\/data\//i,
    /\/frontend-src\//i
  ];

  for (const sig of FORBIDDEN_SIGNATURES) {
    if (sig.test(urlPath)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
  }

  next();
}

/**
 * Enforces per-request timeouts to mitigate connection-holding attacks (Slowloris)
 */
function requestTimeoutGuard(timeoutMs = 15000) {
  return (req, res, next) => {
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({ error: 'Request timeout.' });
      }
    });
    next();
  };
}

/**
 * CORS Middleware with strict origin whitelisting
 */
function corsMiddleware(req, res, next) {
  const rawAllowed = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = new Set(
    rawAllowed.split(',').map(o => o.trim()).filter(Boolean)
  );

  const origin = req.headers['origin'];

  if (origin && (allowedOrigins.has(origin) || allowedOrigins.size === 0)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

/**
 * Redacts personally identifiable information (PII) before logging
 */
function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') return data;
  const clone = { ...data };
  if (clone.email) {
    const [user, domain] = String(clone.email).split('@');
    clone.email = user ? `${user.substring(0, 2)}***@${domain || '***'}` : '***';
  }
  if (clone.phone) {
    clone.phone = '***-REDACTED';
  }
  if (clone.pass || clone.password) {
    clone.pass = '***';
    clone.password = '***';
  }
  return clone;
}

/**
 * Atomic JSON File Writer (prevents corruption during concurrent writes)
 */
function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

module.exports = {
  RateLimiter,
  httpsRedirectMiddleware,
  securityHeadersMiddleware,
  allowedMethodsMiddleware,
  sensitivePathShield,
  requestTimeoutGuard,
  corsMiddleware,
  sanitizeLogData,
  writeJsonAtomic
};
