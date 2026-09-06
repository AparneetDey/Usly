import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health.route.js';
import authRoutes from './routes/auth.route.js';
import eventRoutes from './routes/event.route.js';
import letterRoutes from './routes/letter.route.js';
import complaintRoutes from './routes/complaint.route.js';
import imagekitRoutes from './routes/imagekit.route.js';
import momentRoutes from './routes/moment.route.js';
import notificationRoutes from './routes/notification.route.js';
import presenceRoutes from './routes/presence.route.js';

import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Configure CORS for frontend integration (supports local dev & production URLs)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'https://usly-gold.vercel.app',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Allow explicitly listed origins, any localhost origin, or development mode
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      process.env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes Registration
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/letters', letterRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/imagekit', imagekitRoutes);
app.use('/api/v1/moments', momentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/presence', presenceRoutes);

// Duplicate route alias without /v1 prefix for direct requests
app.use('/api/moments', momentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/presence', presenceRoutes);

// Error Handling Middleware Foundation
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
