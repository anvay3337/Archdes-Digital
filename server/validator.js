// ==============================================================================
// Archdes Digital — Enterprise Input Validation & Anti-Spam Security Engine
// ==============================================================================

const ALLOWED_BUDGETS = new Set([
  'Basic',
  'Premium',
  'Luxury',
  'Custom',
  'Under ₹50,000',
  '₹50,000 – ₹1,50,000',
  '₹1,50,000 – ₹3,00,000',
  '₹3,00,000+',
  'Under $5k',
  '$5k – $15k',
  '$15k+',
  'Not specified'
]);

// RFC 5322 compliant, safe email regex without catastrophic backtracking (ReDoS)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// E.164 compatible phone format (allows leading +, digits, spaces, hyphens, brackets)
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/;

/**
 * Escapes HTML entities to prevent Stored / Reflected XSS
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips carriage returns and line feeds to prevent CRLF / SMTP Header Injection
 */
function stripCrlf(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\r\n\t\0%]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Validates and sanitizes contact/inquiry form submissions
 * @param {Object} rawBody Express req.body object
 * @returns {{ valid: boolean, error?: string, isSpam?: boolean, data?: Object }}
 */
function validateInquiryPayload(rawBody) {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return { valid: false, error: 'Invalid submission payload.' };
  }

  // 1. Anti-Bot Honeypot Defense
  // If automated bots fill hidden honeypot fields, flag as spam
  const honeypot = rawBody.website_hp || rawBody.fax_number || rawBody.company_fax || rawBody._gotcha;
  if (honeypot && String(honeypot).trim().length > 0) {
    return { valid: false, isSpam: true, error: 'Spam detected.' };
  }

  let {
    name = '',
    email = '',
    phone = '',
    budget = 'Not specified',
    company = '',
    site = '',
    message = '',
    _ts = 0 // Optional client submission timestamp
  } = rawBody;

  // 2. Fast bot detection (submission in under 800ms)
  if (_ts && Number(_ts) > 0) {
    const elapsed = Date.now() - Number(_ts);
    if (elapsed < 800) {
      return { valid: false, isSpam: true, error: 'Submission received too quickly.' };
    }
  }

  // 3. String coercion and normalization
  name = stripCrlf(String(name));
  email = stripCrlf(String(email)).toLowerCase();
  phone = stripCrlf(String(phone));
  budget = stripCrlf(String(budget));
  company = stripCrlf(String(company));
  site = stripCrlf(String(site));
  message = String(message).trim();

  // 4. Strict Field Validation
  if (name.length < 2 || name.length > 80) {
    return { valid: false, error: 'Name must be between 2 and 80 characters.' };
  }

  if (email.length < 5 || email.length > 100 || !EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  if (phone && (phone.length < 6 || phone.length > 25 || !PHONE_REGEX.test(phone))) {
    return { valid: false, error: 'Please enter a valid phone number.' };
  }

  if (budget && !ALLOWED_BUDGETS.has(budget)) {
    budget = 'Not specified';
  }

  if (company.length > 100) {
    company = company.substring(0, 100);
  }

  if (site.length > 200) {
    site = site.substring(0, 200);
  }

  if (message.length < 5 || message.length > 3000) {
    return { valid: false, error: 'Message must be between 5 and 3,000 characters.' };
  }

  // 5. Construct sanitized safe payload
  const sanitized = {
    name: escapeHtml(name),
    rawName: name,
    email: email,
    phone: phone ? escapeHtml(phone) : 'N/A',
    budget: budget,
    company: company ? escapeHtml(company) : 'N/A',
    site: site ? escapeHtml(site) : 'N/A',
    message: escapeHtml(message),
    rawMessage: message,
    at: new Date().toISOString()
  };

  return { valid: true, data: sanitized };
}

module.exports = {
  validateInquiryPayload,
  escapeHtml,
  stripCrlf,
  ALLOWED_BUDGETS
};
