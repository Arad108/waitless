// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware'); // Update this path

// Apply auth middleware to all booking routes
router.use(verifyToken);

// Booking routes
router.post('/', bookingController.createBooking);
router.get('/user', bookingController.getUserBookings);

module.exports = router;