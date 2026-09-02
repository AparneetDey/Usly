import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Initializes Nodemailer transporter if valid SMTP configuration is provided
   */
  getTransporter() {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const secure = process.env.SMTP_SECURE === 'true';
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD;

      // Check if SMTP credentials exist and are not default placeholder strings
      const isPlaceholder =
        !user ||
        !pass ||
        user === 'your_email@gmail.com' ||
        pass === 'your_app_password';

      if (!host || isPlaceholder) {
        console.warn(
          '⚠️ SMTP credentials missing or using placeholders in .env. Real email notifications will be skipped.'
        );
        return null;
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
    }

    return this.transporter;
  }

  /**
   * Sends an email via Nodemailer
   * @param {Object} options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject line
   * @param {string} options.html - HTML email content
   * @param {string} options.text - Plain text email content
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const transporter = this.getTransporter();

      if (!transporter) {
        console.warn(`[EmailService] Skipping email to ${to}: SMTP not configured in .env.`);
        return { success: false, error: 'SMTP not configured' };
      }

      const from = process.env.EMAIL_FROM || '"Usly" <noreply@usly.app>';

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });

      console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      // Safe error logging without exposing SMTP credentials
      console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
