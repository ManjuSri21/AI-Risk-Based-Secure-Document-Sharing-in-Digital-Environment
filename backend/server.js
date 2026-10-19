
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Trust Render's reverse proxy for client IP and rate limiting.
// Render runs behind a proxy; trust one proxy hop.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SecureShare Backend API is active',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed',
    });
  }

  console.error('[Internal Server Error]', err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error',
  });
});

// Start server
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Wait for MongoDB before accepting API requests.
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `[Server] SecureShare API running on port ${PORT} in ${
          process.env.NODE_ENV || 'development'
        } mode`
      );
      console.log('[Server] Health endpoint: /api/health');
    });

    server.on('error', (err) => {
      console.error('[Server] Failed to start:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('[Server] Startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
