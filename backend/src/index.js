import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.config.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('[Server] Connecting to MongoDB...');
    await connectDB();

    // 2. Start Express server only after database connects successfully
    const server = app.listen(PORT, () => {
      console.log(`[Server] Usly backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle graceful shutdowns
    const gracefulShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
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
