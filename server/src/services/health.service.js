import mongoose from 'mongoose';

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const getHealthStatus = () => {
  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = DB_STATES[dbStateCode] || 'unknown';

  return {
    uptime: process.uptime(),
    dbState: dbStatus,
    timestamp: new Date().toISOString()
  };
};
