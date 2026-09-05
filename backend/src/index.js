import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.config.js';
import { startMomentCleanupInterval } from './services/moment-cleanup.service.js';
import {
  startEventReminderScheduler,
  stopEventReminderScheduler,
} from './services/event-reminder.service.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('[Server] Connecting to MongoDB...');
    await connectDB();

    // 2. Initialize background scheduler for Moment cleanup (sweeps every 3 minutes)
    startMomentCleanupInterval(3 * 60 * 1000);

    // 3. Initialize background scheduler for Event Reminders (sweeps every 1 hour)
    startEventReminderScheduler(60 * 60 * 1000);

    // 4. Start Express server only after database connects successfully
    const server = app.listen(PORT, () => {
      console.log(`[Server] Usly backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle graceful shutdowns
    const gracefulShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      stopEventReminderScheduler();
      server.close(() => {
        console.log('[Server] Express server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server] Critical Startup Error: ${error.message}`);
    console.error('[Server] Server will NOT start due to database connection failure.');
    process.exit(1);
  }
};

startServer();
