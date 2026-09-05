import { Resend } from 'resend';

class EmailService {
  constructor() {
    this.resend = null;
  }

  /**
   * Initializes Resend client if valid API key is provided
   * @returns {Resend|null}
   */
  getResendClient() {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY;

      const isPlaceholder =
        !apiKey ||
        apiKey === 'your_resend_api_key' ||
        apiKey === 're_123456789';

      if (isPlaceholder) {
        console.warn(
          '⚠️ RESEND_API_KEY is missing or using placeholder in environment variables. Real email notifications will be skipped.'
        );
        return null;
      }

      this.resend = new Resend(apiKey);
    }

    return this.resend;
  }

  /**
   * Sends an email via Resend HTTP API
   * @param {Object} options
   * @param {string|string[]} options.to - Recipient email address or list of addresses
   * @param {string} options.subject - Email subject line
   * @param {string} options.html - HTML email content
   * @param {string} [options.text] - Plain text email content
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const resendClient = this.getResendClient();

      if (!resendClient) {
        console.warn(`[EmailService] Skipping email to ${to}: RESEND_API_KEY not configured.`);
        return { success: false, error: 'RESEND_API_KEY not configured' };
      }

      const from = process.env.EMAIL_FROM || 'Usly <onboarding@resend.dev>';

      console.log(`[EmailService] Dispatching email to ${to} via Resend HTTP API...`);

      const payload = {
        from,
        to,
        subject,
        html,
      };

      if (text) {
        payload.text = text;
      }

      const { data, error } = await resendClient.emails.send(payload);

      if (error) {
        console.error(`[EmailService] Failed to send email to ${to} via Resend:`, error.message || error);
        return { success: false, error: error.message || 'Resend email delivery failed' };
      }

      const messageId = data?.id || 'resend-ok';
      console.log(`[EmailService] Email sent successfully to ${to} via Resend. MessageId: ${messageId}`);
      return { success: true, messageId };
    } catch (error) {
      // Safe error logging without exposing API key
      console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
