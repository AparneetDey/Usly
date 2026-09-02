import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Backend health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Usly API is running',
  });
});

export default router;
