// src/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Schedule a new appointment
router.post('/', appointmentController.scheduleAppointment);

// Get all appointments (with query params for filtering)
router.get('/', appointmentController.getAllAppointments);

// Get appointments for a specific business
router.get('/business/:businessId', appointmentController.getBusinessAppointments);

// Get customer's appointments
router.get('/customer', appointmentController.getCustomerAppointments); // Changed from /user

// Get upcoming appointments
router.get('/upcoming', appointmentController.getUpcomingAppointments);

// Get specific appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Cancel appointment
router.put('/:id/cancel', appointmentController.cancelAppointment); // Changed from delete to put

// Get available slots
router.get('/slots', appointmentController.getAvailableSlots);

module.exports = router;