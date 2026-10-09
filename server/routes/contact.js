const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { RateLimiter, writeJsonAtomic, sanitizeLogData } = require('../security');
const { validateInquiryPayload } = require('../validator');
const { sendInquiryEmail } = require('../mailer');

const FILE = path.join(__dirname, '..', 'data', 'messages.json');
// Strict rate limit: 5 submissions per 10 minutes per IP
const contactLimiter = new RateLimiter(600000, 5);

router.post('/', async (req, res) => {
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';

  // 1. Rate limiting check
  if (contactLimiter.isLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many submissions. Please wait 10 minutes before trying again.'
    });
  }

  // 2. Schema validation & anti-bot checks
  const validation = validateInquiryPayload(req.body);
  if (!validation.valid) {
    if (validation.isSpam) {
      // Silently accept spam to confuse automated bots without sending email
      return res.json({ ok: true, success: true });
    }
    return res.status(400).json({ error: validation.error || 'Invalid submission data.' });
  }

  const sanitizedEntry = {
    ...validation.data,
    ip: clientIp.replace(/^.*:/, '') // Clean IPv4/IPv6
  };

  // 3. Safe atomic file persistence
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
    console.warn('[STORAGE] Local file write bypassed (ephemeral environment):', fsErr.message);
  }

  // 4. Dispatch inquiry email
  try {
    const mailResult = await sendInquiryEmail(sanitizedEntry);
    console.log('[INQUIRY RECEIVED]', sanitizeLogData({
      name: sanitizedEntry.name,
      email: sanitizedEntry.email,
      budget: sanitizedEntry.budget,
      delivered: mailResult.delivered
    }));
    return res.json({ ok: true, emailDispatched: mailResult.delivered });
  } catch (mailErr) {
    console.error('[EMAIL ERROR] Unexpected failure in mailer:', mailErr.message);
    return res.json({ ok: true, emailDispatched: false });
  }
});

module.exports = router;
