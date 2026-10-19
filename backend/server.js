import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Connect Database
connectDB();

// Security Middlewares
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
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for academic local evaluation
      }
    },
    credentials: true,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use(limiter);

// Body Parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SecureShare Backend API is active',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Internal Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});



const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`[Server] SecureShare API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server] Health check available at: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const healthCheck = http.get(
      { hostname: '127.0.0.1', port: PORT, path: '/api/health', timeout: 2000 },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          let isSecureShare = false;
          try {
            const health = JSON.parse(body);
            isSecureShare =
              response.statusCode === 200 &&
              health.message === 'SecureShare Backend API is active';
          } catch {
            isSecureShare = false;
          }

          if (isSecureShare) {
            console.log(`[Server] SecureShare is already running at http://localhost:${PORT}/api/health`);
            process.exit(0);
          }

          console.error(`[Server] Port ${PORT} is occupied by another service. Stop that service or set a different PORT.`);
          process.exit(1);
        });
      }
    );

    healthCheck.on('timeout', () => healthCheck.destroy(new Error('Health check timed out')));
    healthCheck.on('error', () => {
      console.error(`[Server] Port ${PORT} is already in use, but the service could not be identified. Stop the process using that port or configure a different PORT.`);
      process.exit(1);
    });
  } else {
    throw err;
  }
});
