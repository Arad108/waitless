// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController'); // Uses the new Singleton
const { 
    verifyToken, 
    checkRole, 
    apiLimiter, 
    handleRefreshToken 
} = require('../middleware/authMiddleware');

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES (Public & Rate Limited)
// ==========================================
// Replaces Firebase Auth. Protected by your 15-min IP limiter.
router.post('/register', apiLimiter, userController.createUser);
router.post('/login', apiLimiter, userController.loginUser);
router.post('/refresh-token', handleRefreshToken);

// ==========================================
// PROTECTED USER ROUTES
// ==========================================
// All routes below this line require a valid JWT token
router.use(verifyToken);

// Your exact original routes:
// ------------------------------------------

// Route to fetch all users (Admin only for security)
router.get('/', checkRole('admin'), userController.getAllUsers);

// Route to get a user by ID
router.get('/:id', userController.getUserById);

// Route to create a new user (Direct Admin creation)
router.post('/', checkRole('admin'), userController.createUser);

// Route to update user details by ID
router.put('/:id', userController.updateUser);

// Route to delete a user by ID (Soft delete in the new controller)
router.delete('/:id', checkRole('admin'), userController.deleteUser);

module.exports = router;