# Security Policy & Maintenance Playbook

## 1. Reporting Security Vulnerabilities

We take the security of Archdes Digital seriously. If you believe you have found a security vulnerability in our website, APIs, or infrastructure, please report it to us responsibly.

### Contact Information
- **Primary Security Email**: `security@archdes.digital`
- **Secondary / Emergency Email**: `archdesdigital@gmail.com`
- **RFC 9116 Policy File**: `https://archdes.digital/.well-known/security.txt`

### Disclosure Guidelines
- Please provide a detailed description of the vulnerability, including steps to reproduce (proof of concept, request payloads, affected URLs).
- Do not exploit the vulnerability to view, modify, or destroy user data.
- Allow us a reasonable timeframe (typically 48–72 hours) to respond and apply a patch before disclosing publicly.
- We will acknowledge receipt of your vulnerability report within 24 hours.

---

## 2. Monthly Security Maintenance Cadence

To keep the application hardened against emerging attack vectors, the following recurring checklist should be executed on the 1st of every month:

| Frequency | Task | Procedure / Command |
| :--- | :--- | :--- |
| **Weekly** | Automated Dependency Audit | Run `npm audit` in root and frontend directories. |
| **Monthly** | Dependency Upgrades | Run `npm update` and test regression suite with `npm test`. |
| **Monthly** | Credential & Secret Audit | Verify all environment variables in production host; ensure no `.env` files are tracked in Git. |
| **Monthly** | Log & Anomaly Review | Review error and rate limit logs for brute force or scanning patterns. |
| **Quarterly** | Backup Restore Drill | Test restoring `/data/messages.json` and database snapshots to a staging instance. |
| **Bi-annually** | TLS & Header Health Check | Scan `https://archdes.digital` on [SecurityHeaders.com](https://securityheaders.com) and [SSL Labs](https://www.ssllabs.com/ssltest/). |

---

## 3. Incident Response Playbook

In the event of a suspected security breach or critical secret exposure:

### Step 1: Containment & Secret Revocation (< 15 Minutes)
1. **Revoke Exposed Credentials**:
   - For compromised Gmail SMTP passwords: Log into Google Account $\rightarrow$ Security $\rightarrow$ 2-Step Verification $\rightarrow$ App Passwords $\rightarrow$ Delete the affected App Password.
   - Generate a fresh 16-character App Password.
2. **Update Production Environment Variables**:
   - Update `SMTP_PASS` in your hosting control panel (Vercel, Railway, Render, VPS) and redeploy immediately.

### Step 2: Investigation & Assessment (< 1 Hour)
1. Check access logs for suspicious spikes in `/enquiry` or unauthorized access attempts.
2. Verify file integrity and review git commits using `git log -p -n 20`.
3. Check `messages.json` or mail delivery logs for unauthorized access or tampering.

### Step 3: Remediation & Patching (< 4 Hours)
1. Patch the identified vulnerability on a dedicated branch.
2. Run automated test suite `npm test` and CI workflow.
3. Merge and deploy to production.

### Step 4: Post-Mortem & Documentation (< 48 Hours)
1. Document the root cause, timeline of events, affected components, and permanent preventative measures in an internal post-mortem document.
