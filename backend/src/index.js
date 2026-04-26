require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { initializeWebSocketServer } = require('./services/webSocketService');

// ==========================================
// 1. IMPORT ROUTES (Cleaned & Consolidated)
// ==========================================
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const queueRoutes = require('./routes/queueRoutes');

const app = express();

// ==========================================
// 2. MONGODB CONNECTION
// ==========================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waitless', {
    useNewUrlParser: true, // Note: These options are deprecated in newer Mongoose versions but safe to leave
    useUnifiedTopology: true,
})
.then(() => console.log('📦 MongoDB Connected Successfully'))
.catch((err) => console.error('MongoDB Connection Error:', err));

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// ==========================================
// 3. MIDDLEWARE
// ==========================================
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Added PATCH for our status updates
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with enhanced security
app.use((req, res, next) => {
    if (req.method !== 'OPTIONS') {
        const sanitizedBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ? {
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

// ==========================================
// 4. API ROUTES
// ==========================================
// Health check route
app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    res.status(200).json(healthCheck);
});

// Main API Endpoints
// Note: Authentication (verifyToken) is now handled INSIDE each route file.
// This allows public endpoints (like /search, /register) to remain accessible!
app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);

// ==========================================
// 5. ERROR HANDLING
// ==========================================
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

// ==========================================
// 6. SERVER INITIALIZATION & WEBSOCKETS
// ==========================================
const server = http.createServer(app);

try {
    initializeWebSocketServer(server);
    console.log('📡 WebSocket server initialized successfully');
} catch (error) {
    console.error('Failed to initialize WebSocket server:', error);
}

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
    🚀 Server is running!
    🌐 HTTP: http://localhost:${PORT}
    🔒 JWT Authentication Enabled
    💾 Database: MongoDB
    🌿 Environment: ${process.env.NODE_ENV || 'development'}
    ⏰ Started at: ${new Date().toISOString()}
    `);
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
    console.log('\nPerforming graceful shutdown...');
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

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);