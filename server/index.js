require("dotenv").config();
const express = require('express');
const nodemailer = require("nodemailer");
const path = require('path');
const { RateLimiter } = require('./security');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// 1. Process-level crash guards to ensure the server never terminates abruptly
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

// 4. Enterprise Security Headers
app.use((req, res, next) => {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // XSS protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict hardware sensor APIs
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Strict Content Security Policy allowing necessary fonts, CDNs, and inline GSAP styles
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
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  next();
});

// 5. General API rate limiter (120 API requests per 10 minutes per IP)
const apiLimiter = new RateLimiter(600000, 120);
app.use('/api', (req, res, next) => {
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  if (apiLimiter.isLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  next();
});

// 6. Body Parsers (JSON & URL-Encoded Form Data)
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true }));

// 7. Gracefully intercept invalid/malformed JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }
  next(err);
});

// 8. Serve Static Assets with caching and security restrictions
const clientDir = path.join(__dirname, '..', 'client');
app.use(
  express.static(clientDir, {
    maxAge: 0,
    etag: true,
    dotfiles: 'ignore',
    setHeaders: (res, filePath) => {
      // Long-term cache for immutable binary assets (images, fonts)
      if (filePath.includes(path.sep + 'assets' + path.sep)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      } else {
        // Always revalidate HTML, CSS, JS
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  })
);

// 9. Health check endpoint for container / cloud uptime monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 10. Enquiry Endpoint
app.post("/enquiry", async (req, res) => {
  // Change these to match the "name" attributes in YOUR form
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("Missing required fields");
  }

  const businessName = process.env.BUSINESS_NAME || "Archdes Digital";

  // Escape the name so visitors can't inject HTML into the email
  const safeName = String(name)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  try {
    // Auto-reply to the visitor
    await transporter.sendMail({
      from: `"${businessName}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Thank you for your enquiry",

      // Plain-text version (for email apps that don't show HTML)
      text:
`Hi ${name},

Thank you for your enquiry. We've received your message and one of our team will get back to you within 24 hours.

If your matter is urgent, you can reply directly to this email.

Warm regards,
${businessName}`,

      // HTML version
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;line-height:1.6">
          <p>Hi ${safeName},</p>
          <p>Thank you for your enquiry. We've received your message and one of our team will get back to you within <strong>24 hours</strong>.</p>
          <p>If your matter is urgent, you can reply directly to this email.</p>
          <p>Warm regards,<br>${businessName}</p>
        </div>`,
    });

    // Notification to admin
    await transporter.sendMail({
      from: `"Website Enquiries" <${process.env.FROM_EMAIL}>`,
      to: process.env.NOTIFY_EMAIL,
      replyTo: email,
      subject: `New enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
      return res.json({ ok: true, message: "Enquiry sent successfully" });
    }
    res.redirect("/thank-you.html");
  } catch (err) {
    console.error("Email error:", err);
    if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
      return res.status(500).json({ error: "Could not send your enquiry. Please try again." });
    }
    res.status(500).send("Could not send your enquiry. Please try again.");
  }
});

// 11. API Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact', require('./routes/contact'));

// 12. API 404 Catch-All
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// 12. Global Production Error Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: IS_PROD ? 'An internal error occurred.' : (err.message || 'Server error')
  });
});

// 13. Start Server with graceful shutdown (when run as standalone server)
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
    // Force close after 5 seconds if connections hang
    setTimeout(() => process.exit(1), 5000).unref();
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
