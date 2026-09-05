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

import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Configure CORS for frontend integration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'https://usly-gold.vercel.app',
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

// Duplicate route alias without /v1 prefix for direct /api/moments requests
app.use('/api/moments', momentRoutes);

// Error Handling Middleware Foundation
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
