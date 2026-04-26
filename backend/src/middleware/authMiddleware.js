// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Business = require('../models/businessModel'); // Required for isBusinessOwner
const rateLimit = require('express-rate-limit');

// 1. Verify JWT token
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
        
        // Check if user still exists AND is an active account
        const user = await User.findOne({ _id: decoded.id, isActive: true }).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'User no longer exists or has been deactivated.' 
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

// 2. Check user role
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

// 3. Check if user is business owner
const isBusinessOwner = async (req, res, next) => {
    try {
        const businessId = req.params.id; // Assuming route is like /business/:id
        const userId = req.user._id;

        const business = await Business.findById(businessId);
        
        if (!business) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Business not found' 
            });
        }

        // Allow Admins to bypass this check, otherwise strict owner check
        if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
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

// 4. Rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
    }
});

// 5. Refresh token middleware
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
        
        // Ensure user is still active before giving a new token
        const user = await User.findOne({ _id: decoded.id, isActive: true });

        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'User not found or deactivated.' 
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