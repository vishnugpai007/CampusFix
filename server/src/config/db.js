import mongoose from 'mongoose';
import { env } from './env.js';

let isConnecting = null;

export const connectDB = async () => {
  // 1. If already connected, reuse connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // 2. If currently connecting, wait for existing promise
  if (isConnecting) {
    await isConnecting;
    return;
  }

  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost.');
    });

    isConnecting = mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    await isConnecting;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  } finally {
    isConnecting = null;
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

