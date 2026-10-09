# Comprehensive Application Security Audit & Hardening Report

**Project**: Archdes Digital (`archdes-digital`)  
**Auditor**: Senior Full-Stack Engineer & Application Security Specialist (OWASP / DevSecOps)  
**Target Branch**: `security-hardening`  
**Date**: October 2026  
**Status**: Completed & Verified  

---

## 1. Executive Summary & Stack Architecture

Archdes Digital is a high-performance web agency application providing modern digital branding, interactive 3D motion experiences, and business enquiry intake.

### Detected Technology Stack
| Layer | Technology | Deployment Architecture |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, TypeScript, TailwindCSS v4, Three.js, GSAP 3.12.5, Lenis Scroll | Single-bundle compiled static client in `/client` (built via Vite) |
| **Backend API** | Node.js, Express 4.19 | REST API endpoints (`/enquiry`, `/api/contact`, `/api/health`) |
| **Email Dispatch** | Nodemailer (SMTP over TLS 587) | Gmail SMTP integration for inbound lead dispatch & alerts |
| **Storage / DB** | Local Atomic JSON Store (`/data/messages.json`) | Crash-resilient file persistence with fallback for serverless |
| **Hosting & Proxy** | Node Server / Vercel / Cloudflare Reverse Proxy | Static edge assets + serverless / containerized Express API |

---

## 2. Vulnerability & Risk Assessment Matrix

All identified vulnerabilities were categorized under the **OWASP Top 10** and **CWE (Common Weakness Enumeration)** standards.

| ID | Vulnerability Description | Severity | CWE / OWASP | Location | Remediation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **Hardcoded Plaintext Email App Password in Source Code & Git History** | **CRITICAL** | CWE-798 / OWASP A07 | `server/mailer.js:6` (Commit `839e0da`) | **REMEDIATED** in code. Key rotation required by user in Google Account. |
| **SEC-02** | **Lack of User Input Validation & Unsanitized Email Headers (CRLF / Header Injection)** | **HIGH** | CWE-20, CWE-93 / OWASP A03 | `server/index.js`, `server/routes/contact.js` | **REMEDIATED** with RFC regex, E.164 phone check, CRLF stripping, and HTML entity encoding. |
| **SEC-03** | **Missing HTTP Security Headers & Clickjacking Exposure** | **HIGH** | CWE-1021, CWE-693 / OWASP A05 | `server/security.js` | **REMEDIATED** with strict CSP (`frame-ancestors 'none'`), HSTS (1 yr preload), X-Content-Type-Options, Permissions-Policy, COOP/CORP. |
| **SEC-04** | **Unrestricted Information Disclosure via Dotfiles & Sensitive Paths (`.env`, `.git`)** | **HIGH** | CWE-200, CWE-541 / OWASP A01 | `server/index.js` (Express static) | **REMEDIATED** with `sensitivePathShield` middleware returning 403 Forbidden for all forbidden file patterns and dotfiles. |
| **SEC-05** | **Absence of Anti-Spam & Automated Bot Defenses on Lead Intake Endpoints** | **MEDIUM** | CWE-799, CWE-400 / OWASP A04 | `/enquiry`, `/api/contact` | **REMEDIATED** with dual invisible honeypots (`website_hp`, `fax_number`), IP rate limiters, and payload length caps. |
| **SEC-06** | **Third-Party CDN Script Tampering Risk (Missing Subresource Integrity)** | **MEDIUM** | CWE-353 / OWASP A08 | `froont/index.html` (GSAP 3.12.5) | **REMEDIATED** with SHA-384 cryptographic integrity hash and `crossorigin="anonymous"`. |
| **SEC-07** | **Insecure Request Verb Handling & Slowloris DoS Vulnerability** | **LOW** | CWE-400 / OWASP A05 | `server/security.js` | **REMEDIATED** with strict method whitelisting (`allowedMethodsMiddleware`) and 15-second request timeout guards. |
| **SEC-08** | **Potential Data Corruption During High-Concurrency File Writes** | **LOW** | CWE-362 | `server/routes/contact.js` | **REMEDIATED** with atomic temporary file writes + atomic rename (`writeJsonAtomic`). |

---

## 3. Comprehensive Fixes Applied

### Layer 1: Transport & Network Security
- **301 HTTPS Enforcement**: Added proxy-aware HTTPS redirect middleware (`httpsRedirectMiddleware`) supporting `x-forwarded-proto` and `cf-visitor`.
- **HSTS Configured**: Enabled `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.

### Layer 2: HTTP Security Headers
- **Content-Security-Policy (CSP)**: Added strict script/style source restrictions, blocking inline framing (`frame-ancestors 'none'`), and requiring HTTPS connections.
- **X-Content-Type-Options**: Set to `nosniff`.
- **X-Frame-Options**: Set to `DENY` to eliminate clickjacking vectors.
- **Permissions-Policy**: Restricted geolocation, camera, microphone, and payment APIs.
- **Cross-Origin Isolation**: Enabled `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-origin`.
- **Server Version Disclosure**: Disabled `X-Powered-By` header in Express.

### Layer 3: Input Validation, Sanitization & Anti-Spam
- **Strict Payload Validation** ([server/validator.js](file:///c:/Users/Home/Desktop/archdes-digital/archdes-digital/server/validator.js)):
  - Names validated for UTF-8 letters, spaces, hyphens, length 2–80.
  - Emails validated via RFC 5322 regex, lowercase normalized, length <= 254.
  - Phones validated against E.164 international standard.
  - Budget verified against predefined allowable tiers.
  - Messages sanitized via HTML entity escaping (`&`, `<`, `>`, `"`, `'`).
  - CRLF characters (`\r`, `\n`) stripped from all email header fields.
- **Bot Honeypots**: Added invisible fields `website_hp` and `fax_number`. If automated bots populate these fields, requests are immediately dropped and given a silent 200 OK without triggering server resources or sending outbound emails.

### Layer 4: Storage, Memory & DoS Resilience
- **Atomic File Store**: Implemented `writeJsonAtomic` in [server/security.js](file:///c:/Users/Home/Desktop/archdes-digital/archdes-digital/server/security.js) writing to `.tmp` files before renaming to prevent corrupted JSON data on process interruptions.
- **Payload Limits**: Strict 16 KB request body limit to prevent RAM exhaustion.
- **Rate Limiting**: Tiered token-bucket limiters:
  - Max 120 API requests per 10 minutes per IP.
  - Max 5 contact submissions per 10 minutes per IP.
- **Slowloris Timeout Guard**: 15,000ms maximum request socket timeout.

### Layer 5: Secrets Management & Privacy
- **Zero Hardcoded Secrets**: Converted `mailer.js` to strictly load `SMTP_USER` and `SMTP_PASS` from environment variables.
- **Environment Template**: Created `.env.example` with detailed documentation and dummy variables.
- **PII-Masked Logging**: Added `sanitizeLogData` middleware masking email addresses (`j***e@domain.com`) and phone numbers in server logs.
- **RFC 9116 security.txt**: Created `client/.well-known/security.txt` and `client/robots.txt`.

### Layer 6: DevSecOps CI/CD
- Created GitHub Actions workflow [`.github/workflows/security.yml`](file:///c:/Users/Home/Desktop/archdes-digital/archdes-digital/.github/workflows/security.yml) automating:
  - `npm audit --audit-level=high`
  - Automated security and regression integration tests (`npm test`)
  - TruffleHog automated secret scanning

---

## 4. Remaining Operational Risks

1. **Leaked Gmail App Password in Past Git Commits**:
   - The credential `pcidegpvdkbzqmmq` was present in commit history (`839e0da`).
   - **Action Required**: You MUST revoke this App Password in Google Account Settings immediately and generate a new password (see checklist below).
2. **Ephemeral File Storage in Serverless Environments**:
   - When deployed on platforms like Vercel or AWS Lambda, the local filesystem `/data/messages.json` is ephemeral and resets between cold starts.
   - **Recommendation**: Inbound inquiries are delivered to Gmail via SMTP. For permanent message archiving, connect a managed PostgreSQL (Supabase / Neon) or MongoDB database.
3. **Public DNS / WAF Protection**:
   - Application-level rate limiting is active, but large-scale volumetric DDoS attacks require Cloudflare or AWS CloudFront proxying.
