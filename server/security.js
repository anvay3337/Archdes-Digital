// Security and sanitization utility for Archdes Digital Server
const fs = require('fs');
const path = require('path');

// Escape HTML entities to prevent Stored XSS
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// In-memory sliding window rate limiter with auto-pruning
class RateLimiter {
  constructor(windowMs, maxHits) {
    this.windowMs = windowMs;
    this.maxHits = maxHits;
    this.hits = new Map();
    // Auto-prune expired records every 5 minutes
    setInterval(() => this.prune(), Math.min(windowMs, 300000)).unref();
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

// Atomic file writer
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
  sanitizeText,
  RateLimiter,
  writeJsonAtomic
};
