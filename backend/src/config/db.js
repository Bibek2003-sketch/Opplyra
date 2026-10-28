const mongoose = require('mongoose');
const fs = require('fs');

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
    try {
      console.log(`[Database] Attempting MongoDB connection to ${uri}...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });

      dbState.isConnected = true;
      dbState.mode = 'mongodb';
      dbState.lastError = null;
      dbState.connectionTarget = uri;
      console.log(`[Database] Successfully connected to persistent MongoDB via ${uri}`);
      break;
    } catch (err) {
      console.warn(`[Database] Connection to ${uri} failed: ${err.message}`);
      dbState.lastError = err.message;
    }
  }

  if (!dbState.isConnected) {
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

