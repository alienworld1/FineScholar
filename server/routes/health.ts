import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FineScholar API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export { router as healthRoute };
