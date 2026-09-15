import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost. Disconnected.');
    });

    await mongoose.connect(env.MONGO_URI);
  } catch (error) {
    console.error('Failed to connect to MongoDB on startup:', error.message);
    process.exit(1);
  }
};

const handleGracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB connection shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
