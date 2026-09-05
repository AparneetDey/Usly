import express from 'express';
import emailService from '../services/email.service.js';

const router = express.Router();

/**
 * @route   GET /api/v1/health
 * @desc    Backend health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Usly API is running',
  });
});

/**
 * @route   POST /api/v1/health/dev/test-email
 * @desc    Dev-only test endpoint to send a test email via Resend
 * @access  Dev only
 */
router.post('/dev/test-email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Dev test email endpoint disabled in production' });
  }

  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ success: false, message: 'Recipient "to" email address required' });
  }

  const result = await emailService.sendEmail({
    to,
    subject: 'Usly Resend Integration Test',
    html: '<h1>Usly Resend Test</h1><p>This is a test email sent via Resend HTTP API from Usly backend.</p>',
    text: 'This is a test email sent via Resend HTTP API from Usly backend.',
  });

  return res.status(result.success ? 200 : 500).json(result);
});

export default router;
