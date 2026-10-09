require("dotenv").config();
const express = require('express');
const path = require('path');
const {
  RateLimiter,
  httpsRedirectMiddleware,
  securityHeadersMiddleware,
  allowedMethodsMiddleware,
  sensitivePathShield,
  requestTimeoutGuard,
  corsMiddleware,
  sanitizeLogData
} = require('./security');
const { validateInquiryPayload } = require('./validator');
const { sendInquiryEmail } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// 1. Process-level crash guards to ensure server resilience
process.on('uncaughtException', err => {
  console.error('[CRITICAL] Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// 2. Trust first proxy if deployed behind Cloudflare, Nginx, or AWS ALB
app.set('trust proxy', 1);

// 3. Remove Express fingerprinting header
app.disable('x-powered-by');

// 4. Transport, Methods & Path Protection Layers
app.use(httpsRedirectMiddleware);
app.use(allowedMethodsMiddleware);
app.use(sensitivePathShield);
app.use(securityHeadersMiddleware);
app.use(requestTimeoutGuard(15000));
app.use(corsMiddleware);

// 5. General API rate limiter (120 API requests per 10 minutes per IP)
const apiLimiter = new RateLimiter(600000, 120);
const enquiryLimiter = new RateLimiter(600000, 5);

app.use('/api', (req, res, next) => {
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  if (apiLimiter.isLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  next();
});

// 6. Body Parsers with Strict Size Limits (prevents Memory Exhaustion / DoS)
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// 7. Intercept Malformed JSON Payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }
  next(err);
});

// 8. Serve Static Assets with Cache-Control & Security Shielding
const clientDir = path.join(__dirname, '..', 'client');
app.use(
  express.static(clientDir, {
    maxAge: 0,
    etag: true,
    dotfiles: 'allow', // safe because sensitivePathShield filters unauthorized dotfiles before static handler
    setHeaders: (res, filePath) => {
      if (filePath.includes(path.sep + 'assets' + path.sep)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  })
);

// 9. Detailed Health Check Endpoint (Cloud / Container Monitoring)
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    health: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: IS_PROD ? 'production' : 'development',
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
    }
  });
});

// 10. Unified Enquiry Endpoint (Standard HTML Form & AJAX Submissions)
app.post('/enquiry', async (req, res) => {
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';

  if (enquiryLimiter.isLimited(clientIp)) {
    if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
      return res.status(429).json({ error: 'Too many submissions. Please wait 10 minutes.' });
    }
    return res.status(429).send('Too many submissions. Please wait 10 minutes.');
  }

  const validation = validateInquiryPayload(req.body);
  if (!validation.valid) {
    if (validation.isSpam) {
      if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
        return res.json({ ok: true });
      }
      return res.redirect('/thank-you.html');
    }
    if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
      return res.status(400).json({ error: validation.error || 'Invalid submission data.' });
    }
    return res.status(400).send(validation.error || 'Invalid submission data.');
  }

  const sanitizedEntry = {
    ...validation.data,
    ip: clientIp.replace(/^.*:/, '')
  };

  try {
    const mailResult = await sendInquiryEmail(sanitizedEntry);
    console.log('[ENQUIRY PROCESSED]', sanitizeLogData({
      name: sanitizedEntry.name,
      email: sanitizedEntry.email,
      budget: sanitizedEntry.budget,
      delivered: mailResult.delivered
    }));

    if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
      return res.json({ ok: true, message: 'Enquiry sent successfully.' });
    }
    return res.redirect('/thank-you.html');
  } catch (err) {
    console.error('[ENQUIRY ERROR]', err.message || err);
    if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
      return res.status(500).json({ error: 'Could not send your enquiry. Please try again.' });
    }
    return res.status(500).send('Could not send your enquiry. Please try again.');
  }
});

// 11. API Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact', require('./routes/contact'));

// 12. API 404 Catch-All
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// 13. Global Error Handling Middleware (No Stack Traces Leaked in Production)
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: IS_PROD ? 'An internal error occurred.' : (err.message || 'Server error')
  });
});

// 14. Start Server with Graceful Shutdown
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Archdes Digital secure server running at http://localhost:${PORT}`);
  });

  function gracefulShutdown(signal) {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
