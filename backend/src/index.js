require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose'); // Add mongoose
const { initializeWebSocketServer } = require('./services/webSocketService');
const { verifySession } = require('./controllers/authController');
const healthFacilityRoutes= require('./routes/healthFacilityRoutes');

// Import routes
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const queueRoutes = require('./routes/queueRoutes');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waitless', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📦 MongoDB Connected Successfully'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with enhanced security
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    const sanitizedBody = req.method === 'POST' ? {
      ...req.body,
      password: req.body?.password ? '[REDACTED]' : undefined,
      email: req.body?.email ? req.body.email.substring(0, 3) + '***' : undefined,
      full_name: req.body?.full_name ? req.body.full_name.split(' ')[0] + ' ***' : undefined,
      role: req.body?.role
    } : undefined;

    console.log('[Request]:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query,
      body: sanitizedBody,
      ip: req.ip
    });
  }
  next();
});

// Health check route
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.status(200).json(healthCheck);
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifySession, userRoutes);
app.use('/api/businesses', verifySession, businessRoutes);
app.use('/api/appointments', verifySession, appointmentRoutes);
app.use('/api/queue', verifySession, queueRoutes);
app.use('/api/health-facilities', healthFacilityRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware with improved error responses
app.use((err, req, res, next) => {
  console.error('[Error]:', {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server with error handling
try {
  initializeWebSocketServer(server);
  console.log('WebSocket server initialized successfully');
} catch (error) {
  console.error('Failed to initialize WebSocket server:', error);
}

// Root route with basic server info
app.get('/', (req, res) => {
  res.json({
    message: 'Waitless API Server',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB',
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  });
});

// Start server with enhanced logging
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
    🚀 Server is running!
    🌐 HTTP: http://localhost:${PORT}
    🔒 Authentication enabled
    💾 Database: MongoDB
    🌿 Environment: ${process.env.NODE_ENV || 'development'}
    ⏰ Started at: ${new Date().toISOString()}
  `);
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('Performing graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    server.close(() => {
      console.log('Server closed. Process terminating...');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);