// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const authController = require('../controllers/authController');

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        // Validate input
        if (!email || !password || !full_name) {
            return res.status(400).json({ 
                status: 'error',
                message: 'All fields are required' 
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid email format'
            });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 8 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email already registered' 
            });
        }

        // Create new user
        const newUser = new User({
            email,
            password, // Password will be hashed by mongoose middleware
            full_name,
            role: role || 'customer'
        });

        await newUser.save();

        // Generate tokens
        const token = authController.generateToken(newUser);
        const refreshToken = authController.generateRefreshToken(newUser);

        // Set refresh token as cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Prepare user response without sensitive data
        const userResponse = {
            id: newUser._id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role,
            created_at: newUser.created_at
        };

        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email and password are required' 
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Invalid credentials' 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Invalid credentials' 
            });
        }

        // Generate tokens
        const token = authController.generateToken(user);
        const refreshToken = authController.generateRefreshToken(user);

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Prepare user response data
        const userResponse = {
            id: user._id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            created_at: user.created_at,
            business_details: user.business_details || null,
            preferences: user.preferences || null,
            profile_complete: user.profile_complete || false
        };

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Login failed' 
        });
    }
});

// Auth check route
router.get('/check', authController.verifySession, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ 
            status: 'success',
            user 
        });
    } catch (error) {
        res.status(401).json({ 
            status: 'error',
            message: 'Authentication failed' 
        });
    }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Refresh token not found' 
            });
        }

        const newToken = await authController.refreshToken(refreshToken);
        
        res.json({
            status: 'success',
            token: newToken
        });
    } catch (error) {
        res.status(401).json({ 
            status: 'error',
            message: 'Invalid refresh token' 
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    
    res.json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

// Protected routes
router.get('/protected/business', 
    authController.verifySession, 
    authController.requireRole(['business_owner']), 
    (req, res) => {
        res.json({ 
            status: 'success',
            message: 'Business owner access granted' 
        });
    }
);

router.get('/protected/customer', 
    authController.verifySession, 
    authController.requireRole(['customer']), 
    (req, res) => {
        res.json({ 
            status: 'success',
            message: 'Customer access granted' 
        });
    }
);

module.exports = router;