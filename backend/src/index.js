require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDbStatus } = require('./config/db');
const Opportunity = require('./models/Opportunity');
const { sampleOpportunities } = require('./seeds/seedData');

// Import Route Handlers
const opportunityRoutes = require('./routes/opportunityRoutes');
const savedRoutes = require('./routes/savedRoutes');
const profileRoutes = require('./routes/profileRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Strict request body size limit to avoid abuse / denial of service
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health & System Status Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'online',
    appName: 'Opplyra API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      mode: dbStatus.mode,
      isConnected: dbStatus.isConnected,
      description: dbStatus.mode === 'mongodb'
        ? 'Durable persistent storage connected via MongoDB / Mongoose.'
        : 'In-Memory Dev Fallback active. Data is non-durable and will reset on process restart.'
    }
  });
});

// Mount Resource Routes
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reminders', reminderRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint "${req.method} ${req.originalUrl}" not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server and Initialize Database
async function startServer() {
  const dbState = await connectDB();

  // If MongoDB is connected and empty, auto-seed with demonstration records
  if (dbState.mode === 'mongodb') {
    try {
      const count = await Opportunity.countDocuments();
      if (count === 0) {
        console.log('[Init] Database is empty. Auto-seeding demonstration catalogue...');
        await Opportunity.insertMany(sampleOpportunities);
        console.log(`[Init] Seeded ${sampleOpportunities.length} opportunities.`);
      }
    } catch (seedErr) {
      console.warn('[Init] Auto-seed warning:', seedErr.message);
    }
  }

  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`===============================================`);
    console.log(` Opplyra API Server running on port ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Storage: ${dbState.mode.toUpperCase()}`);
    console.log(` URL: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };

