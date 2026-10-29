const mongoose = require('mongoose');
const fs = require('fs');
const { maskMongoUri } = require('../utils/sanitizeLog');

let dbState = {
  isConnected: false,
  mode: 'disconnected', // 'mongodb' | 'memory' | 'disconnected'
  lastError: null,
  connectionTarget: null,
};

async function connectDB() {
  const envUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opplyra';
  const socketPath = '/tmp/mongodb-27017.sock';
  const socketUri = `mongodb://${encodeURIComponent(socketPath)}/opplyra`;

  const candidateUris = [envUri, 'mongodb://127.0.0.1:27017/opplyra'];
  // If unix socket exists on disk and wasn't the primary URI, add it as secondary candidate
  if (fs.existsSync(socketPath) && !candidateUris.includes(socketUri)) {
    candidateUris.push(socketUri);
  }

  mongoose.set('strictQuery', false);

  for (const uri of candidateUris) {
    const safeUri = maskMongoUri(uri);
    try {
      console.log(`[Database] Attempting MongoDB connection to ${safeUri}...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });

      dbState.isConnected = true;
      dbState.mode = 'mongodb';
      dbState.lastError = null;
      dbState.connectionTarget = safeUri;
      console.log(`[Database] Successfully connected to persistent MongoDB via ${safeUri}`);
      break;
    } catch (err) {
      const safeError = maskMongoUri(err.message);
      console.warn(`[Database] Connection to ${safeUri} failed: ${safeError}`);
      dbState.lastError = safeError;
    }
  }

  if (!dbState.isConnected) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_IN_MEMORY_FALLBACK !== 'true') {
      const errMsg = `[Database FATAL] MongoDB persistent connection failed in production mode (${dbState.lastError}). In-memory fallback is disabled in production to prevent silent data loss.`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
    dbState.mode = 'memory';
    dbState.connectionTarget = 'in-memory-fallback';
    console.warn(`[Database] MongoDB persistent service unavailable. Activated In-Memory Dev Fallback (Non-durable).`);
  }

  mongoose.connection.on('disconnected', () => {
    dbState.isConnected = false;
    dbState.mode = 'memory';
    console.warn('[Database] MongoDB disconnected. Switched to In-Memory Dev Fallback.');
  });

  mongoose.connection.on('reconnected', () => {
    dbState.isConnected = true;
    dbState.mode = 'mongodb';
    console.log('[Database] MongoDB reconnected.');
  });

  return dbState;
}

function getDbStatus() {
  return {
    ...dbState,
    mongooseState: mongoose.connection.readyState,
  };
}

module.exports = {
  connectDB,
  getDbStatus,
};

