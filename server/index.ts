import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { processApplicationRoute } from './routes/processApplication';
import { healthRoute } from './routes/health';
import { donorStatsRoute } from './routes/donorStats';
import { mcpCalculateMeritRoute } from './routes/mcpCalculateMeritRoute';
import { mcpProcessStudentRoute } from './routes/mcpProcessStudentRoute';
import { mcpRecentEventsRoute } from './routes/mcpRecentEventsRoute';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug: Log some key environment variables
console.log('🔧 Environment Variables Loaded:');
console.log('   PORT:', process.env.PORT);
console.log(
  '   GEMINI_API_KEY:',
  process.env.GEMINI_API_KEY ? 'Set ✅' : 'Missing ❌',
);
console.log(
  '   ADMIN_PRIVATE_KEY:',
  process.env.ADMIN_PRIVATE_KEY ? 'Set ✅' : 'Missing ❌',
);
console.log('   SEI_RPC_URL:', process.env.SEI_RPC_URL);
console.log(
  '   SCHOLARSHIP_FUND_ADDRESS:',
  process.env.VITE_SCHOLARSHIP_FUND_ADDRESS,
);
console.log('');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoute);
app.use('/api', processApplicationRoute);
app.use('/api', donorStatsRoute);
app.use('/api', mcpCalculateMeritRoute);
app.use('/api', mcpProcessStudentRoute);
app.use('/api', mcpRecentEventsRoute);

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Something went wrong',
    });
  },
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FineScholar API Server running on port ${PORT}`);
  console.log(
    `📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`,
  );
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

export default app;
