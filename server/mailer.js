const nodemailer = require('nodemailer');

const RECIPIENT_EMAIL = process.env.CONTACT_EMAIL || 'archdesdigital@gmail.com';

const DEFAULT_USER = 'archdesdigital@gmail.com';
const DEFAULT_PASS = 'pcidegpvdkbzqmmq';

/**
 * Creates an SMTP transporter using environment variables or configured defaults.
 * Compatible with Gmail App Passwords, Resend SMTP, SendGrid, or generic SMTP providers.
 */
function getTransporter() {
  const rawUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER || DEFAULT_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || DEFAULT_PASS;
  
  const user = rawUser ? rawUser.trim() : '';
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465);

  if (!user || !pass) {
    return null;
  }

  // Gmail service shortcut or custom host
  if (host === 'smtp.gmail.com' && !process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

/**
 * Sends inquiry email in JSON format to archdesdigital@gmail.com
 * @param {Object} payload Sanitized submission payload
 */
async function sendInquiryEmail(payload) {
  const jsonString = JSON.stringify(payload, null, 2);
  const transporter = getTransporter();

  const senderUser = (process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER || DEFAULT_USER).trim();

  const mailOptions = {
    from: `"Archdes Digital Inquiries" <${senderUser}>`,
    to: RECIPIENT_EMAIL,
    replyTo: payload.email,
    subject: `[New Inquiry] ${payload.name} (${payload.budget})`,
    text: `New project inquiry received:\n\n${jsonString}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #06070b; color: #f1f5f9; padding: 28px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
          <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.05em;">ARCHDES DIGITAL</h2>
          <span style="color: #00d2ff; font-size: 13px; font-weight: 600; margin-left: auto;">NEW INQUIRY</span>
        </div>

        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 18px;">A new project lead was submitted through the website. Details in JSON payload format below:</p>

        <div style="background: #0d101a; border: 1px solid rgba(0, 210, 255, 0.25); border-radius: 10px; padding: 18px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; width: 110px;"><strong>Client Name:</strong></td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${payload.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Email:</strong></td>
              <td style="padding: 6px 0; color: #00d2ff;"><a href="mailto:${payload.email}" style="color: #00d2ff; text-decoration: none;">${payload.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Phone:</strong></td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 600;"><a href="tel:${payload.phone || ''}" style="color: #ffffff; text-decoration: none;">${payload.phone || 'N/A'}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Budget:</strong></td>
              <td style="padding: 6px 0; color: #ff2e93; font-weight: 600;">${payload.budget}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Timestamp:</strong></td>
              <td style="padding: 6px 0; color: #94a3b8;">${payload.at}</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #8b5cf6; font-size: 15px; margin-top: 24px; margin-bottom: 8px;">JSON Payload:</h3>
        <pre style="background: #020305; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; color: #7dd3fc; font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; overflow-x: auto; line-height: 1.5; white-space: pre-wrap;">${jsonString.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748b; text-align: center;">
          Archdes Digital Inquiries System &bull; <a href="mailto:${payload.email}" style="color: #00d2ff; text-decoration: none;">Reply to Client</a>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `inquiry-${Date.now()}.json`,
        content: jsonString,
        contentType: 'application/json'
      }
    ]
  };

  if (!transporter) {
    console.warn('[EMAIL WARNING] SMTP credentials not set (SMTP_USER / SMTP_PASS). Message JSON logged below:');
    console.log(jsonString);
    return {
      success: true,
      delivered: false,
      reason: 'SMTP credentials not configured. Message archived and logged.'
    };
  }

  try {
    // 1. Notification to Admin
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Inquiry notification dispatched to ${RECIPIENT_EMAIL}. MessageId: ${info.messageId}`);

    // 2. Branded Auto-Reply to Visitor
    if (payload.email) {
      const businessName = process.env.BUSINESS_NAME || 'Archdes Digital';
      const safeName = String(payload.name || 'there')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      try {
        await transporter.sendMail({
          from: `"${businessName}" <${senderUser}>`,
          to: payload.email,
          subject: 'Thank you for your enquiry',
          text: `Hi ${payload.name},\n\nThank you for your enquiry. We've received your message and one of our team will get back to you within 24 hours.\n\nIf your matter is urgent, you can reply directly to this email.\n\nWarm regards,\n${businessName}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;line-height:1.6">
              <p>Hi ${safeName},</p>
              <p>Thank you for your enquiry. We've received your message and one of our team will get back to you within <strong>24 hours</strong>.</p>
              <p>If your matter is urgent, you can reply directly to this email.</p>
              <p>Warm regards,<br>${businessName}</p>
            </div>`
        });
        console.log(`[AUTO-REPLY SENT] Sent to visitor: ${payload.email}`);
      } catch (replyErr) {
        console.warn('[AUTO-REPLY WARNING] Could not send auto-reply to client:', replyErr.message);
      }
    }

    return {
      success: true,
      delivered: true,
      messageId: info.messageId
    };
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to deliver mail to SMTP:', err.message);
    return {
      success: false,
      delivered: false,
      error: err.message
    };
  }
}

module.exports = {
  sendInquiryEmail,
  RECIPIENT_EMAIL
};
