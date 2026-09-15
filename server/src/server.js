import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

// Global handler for synchronous uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down immediately...', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    // 1. Establish database connection before accepting HTTP requests
    await connectDB();

    // 2. Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log(`CampusFix server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Handle unhandled promise rejections gracefully
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down gracefully...', err);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
