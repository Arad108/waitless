// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// Generate token function
exports.generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            role: user.role,
            email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Generate refresh token function
exports.generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

// Register controller
exports.register = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        // Validate input
        if (!email || !password || !full_name) {
            return res.status(400).json({ 
                status: 'error',
                message: 'All fields are required' 
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
            password, // Will be hashed by mongoose middleware
            full_name,
            role: role || 'customer'
        });

        await newUser.save();

        // Generate tokens
        const token = this.generateToken(newUser);
        const refreshToken = this.generateRefreshToken(newUser);

        // Set refresh token as cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

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
            message: error.message || 'Registration failed' 
        });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email and password are required' 
            });
        }

        // Find user and include password
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
        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

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

        // Set refresh token as cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

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
            message: 'Authentication failed' 
        });
    }
};

// Verify session middleware
exports.verifySession = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                status: 'error',
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'User no longer exists' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(401).json({ 
            status: 'error',
            message: 'Invalid or expired token' 
        });
    }
};

// Role-based access middleware
exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 'error',
                message: 'Insufficient permissions' 
            });
        }
        next();
    };
};

// Check auth status
exports.checkAuth = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                status: 'error',
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        res.status(200).json({ 
            status: 'success',
            user 
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({ 
            status: 'error',
            message: 'Invalid or expired token' 
        });
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Refresh token not found' 
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        // Generate new access token
        const newToken = this.generateToken(user);

        res.status(200).json({
            status: 'success',
            token: newToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Failed to refresh token' 
        });
    }
};

// Logout
exports.logout = (req, res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
};

// Password reset request
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'No user found with this email'
            });
        }

        // Generate password reset token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In a real application, send this token via email
        // For now, just return it in the response
        res.status(200).json({
            status: 'success',
            message: 'Password reset token generated',
            resetToken
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process password reset request'
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to reset password'
        });
    }
};