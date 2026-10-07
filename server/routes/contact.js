const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { sanitizeText, RateLimiter, writeJsonAtomic } = require('../security');

const FILE = path.join(__dirname, '..', 'data', 'messages.json');
// Strict rate limit: 5 submissions per 10 minutes per IP
const contactLimiter = new RateLimiter(600000, 5);

const ALLOWED_BUDGETS = new Set([
  'Under ₹50,000',
  '₹50,000 – ₹1,50,000',
  '₹1,50,000 – ₹3,00,000',
  '₹3,00,000+',
  'Under $5k',
  '$5k – $15k',
  '$15k+',
  'Not specified'
]);

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const { sendInquiryEmail } = require('../mailer');

router.post('/', async (req, res) => {
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';

  // 1. Rate limiting check
  if (contactLimiter.isLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait 10 minutes before trying again.' });
  }

  // 2. Validate payload presence
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid submission data.' });
  }

  let { name = '', email = '', phone = '', budget = '', message = '' } = req.body;

  // 3. String coercion and trimming
  name = String(name).trim();
  email = String(email).trim().toLowerCase();
  phone = String(phone).trim();
  budget = String(budget).trim();
  message = String(message).trim();

  // 4. Strict field validation
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Name must be between 2 and 100 characters.' });
  }

  if (email.length < 5 || email.length > 120 || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid business email address.' });
  }

  if (phone.length < 6 || phone.length > 25) {
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
  }

  if (budget && !ALLOWED_BUDGETS.has(budget)) {
    budget = 'Not specified';
  } else if (!budget) {
    budget = 'Not specified';
  }

  if (message.length < 10 || message.length > 3000) {
    return res.status(400).json({ error: 'Message must be between 10 and 3,000 characters.' });
  }

  // 5. Sanitize text fields to eliminate any XSS risk
  const sanitizedEntry = {
    name: sanitizeText(name),
    email: sanitizeText(email),
    phone: sanitizeText(phone),
    budget: sanitizeText(budget),
    message: sanitizeText(message),
    at: new Date().toISOString(),
    ip: clientIp.replace(/^.*:/, '') // store anonymized/clean IPv4/IPv6 suffix
  };

  // 6. Safe atomic file persistence (ephemeral in serverless)
  try {
    let list = [];
    if (fs.existsSync(FILE)) {
      try {
        const raw = fs.readFileSync(FILE, 'utf8');
        list = JSON.parse(raw || '[]');
        if (!Array.isArray(list)) list = [];
      } catch (parseErr) {
        list = [];
      }
    }
    list.push(sanitizedEntry);
    writeJsonAtomic(FILE, list);
  } catch (fsErr) {
    console.warn('[STORAGE] Local file write bypassed (serverless environment):', fsErr.message);
  }

  // 7. Dispatch inquiry email to archdesdigital@gmail.com with JSON payload
  try {
    const mailResult = await sendInquiryEmail(sanitizedEntry);
    return res.json({ ok: true, emailDispatched: mailResult.delivered });
  } catch (mailErr) {
    console.error('[EMAIL ERROR] Unexpected failure in mailer:', mailErr);
    // Still acknowledge client submission gracefully
    return res.json({ ok: true, emailDispatched: false });
  }
});

module.exports = router;
