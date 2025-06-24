// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'User no longer exists.' 
            });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                status: 'error',
                message: 'Invalid token.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                status: 'error',
                message: 'Token has expired.' 
            });
        }
        res.status(500).json({ 
            status: 'error',
            message: 'Authentication error.' 
        });
    }
};

// Check user role
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Authentication required' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 'error',
                message: 'You do not have permission to perform this action' 
            });
        }

        next();
    };
};

// Check if user is business owner
const isBusinessOwner = async (req, res, next) => {
    try {
        const businessId = req.params.id;
        const userId = req.user._id;

        const business = await Business.findById(businessId);
        
        if (!business) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Business not found' 
            });
        }

        if (business.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ 
                status: 'error',
                message: 'You do not have permission to manage this business' 
            });
        }

        req.business = business;
        next();
    } catch (error) {
        next(error);
    }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
    }
});

// Refresh token middleware
const handleRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Refresh token not found.' 
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'User not found.' 
            });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            status: 'success',
            accessToken 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyToken,
    checkRole,
    isBusinessOwner,
    apiLimiter,
    handleRefreshToken
};