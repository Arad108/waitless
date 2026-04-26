// src/routes/appointmentRoutes.js
const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, checkRole, isBusinessOwner } = require('../middleware/authMiddleware');

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No login required)
// ==========================================
// Check available slots before booking
router.get('/available-slots', appointmentController.getAvailableSlots);

// ==========================================
// 1. CUSTOMER ROUTES (Requires Login)
// ==========================================
router.use(verifyToken);

// Book a new appointment (Matches scheduleAppointment!)
router.post('/schedule', appointmentController.scheduleAppointment);

// Get the logged-in user's own booking history (Matches getCustomerAppointments!)
router.get('/my-appointments', appointmentController.getCustomerAppointments);

// Get upcoming appointments only
router.get('/upcoming', appointmentController.getUpcomingAppointments);

// Customer cancelling their own appointment
router.patch('/:id/cancel', appointmentController.cancelAppointment);

// Get a specific appointment by ID
router.get('/:id', appointmentController.getAppointmentById);


// ==========================================
// 2. BUSINESS OWNER & STAFF ROUTES
// ==========================================
// Get all appointments for a specific business dashboard
router.get(
    '/business/:businessId', 
    isBusinessOwner, 
    appointmentController.getBusinessAppointments
);

// Update appointment details (e.g., status, notes)
router.put(
    '/:id', 
    (req, res, next) => {
        // Map businessId so your isBusinessOwner middleware can catch it
        if (req.body.businessId) {
            req.params.id = req.body.businessId; 
        }
        next();
    },
    isBusinessOwner, 
    appointmentController.updateAppointment
);

// ==========================================
// 3. SYSTEM ADMIN ROUTES
// ==========================================
// View every single appointment across the entire platform
router.get('/', checkRole('admin'), appointmentController.getAllAppointments);

module.exports = router;