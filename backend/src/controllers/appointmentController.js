// src/controllers/appointmentController.js
const AppointmentService = require('../services/AppointmentService');
const mongoose = require('mongoose');

class AppointmentController {
    static #instance;

    constructor() {
        if (AppointmentController.#instance) {
            return AppointmentController.#instance;
        }
        AppointmentController.#instance = this;
    }

    // 1. Schedule a new appointment (Merged booking logic)
    scheduleAppointment = async (req, res) => {
        try {
            const {
                businessId, // No more facilityId! Everything is a business now.
                serviceId,
                appointmentTime,
                customerName,
                customerEmail,
                customerPhone,
                notes,
                status
            } = req.body;

            if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
                return res.status(400).json({ status: 'error', message: 'Invalid business ID format' });
            }

            if (!appointmentTime) {
                return res.status(400).json({ status: 'error', message: 'Appointment time is required' });
            }

            if (!customerName || !customerEmail || !customerPhone) {
                return res.status(400).json({ status: 'error', message: 'Customer details are required' });
            }

            const appointmentData = {
                businessId,
                serviceId,
                appointmentTime,
                customerName,
                customerEmail,
                customerPhone,
                notes,
                status: status || 'scheduled',
                userId: req.user?.id, 
                metadata: {
                    source: 'web',
                    paymentStatus: 'pending'
                }
            };

            const appointment = await AppointmentService.scheduleAppointment(appointmentData);

            res.status(201).json({
                status: 'success',
                message: 'Appointment scheduled successfully',
                data: appointment
            });
        } catch (error) {
            console.error('Appointment scheduling error:', error);
            if (error.message.includes('Business not found')) {
                return res.status(404).json({ status: 'error', message: 'Business not found - please check the ID' });
            }
            res.status(400).json({ status: 'error', message: error.message || 'Failed to schedule appointment' });
        }
    };

    // 2. Get all appointments with filtering (Admin/Global)
    getAllAppointments = async (req, res) => {
        try {
            const { status, date, page = 1, limit = 10 } = req.query;
            
            const appointments = await AppointmentService.getAllAppointments({
                status,
                date,
                page: parseInt(page),
                limit: parseInt(limit),
                userId: req.user?.email || req.user?.id,
                role: req.user?.role
            });

            res.status(200).json({ status: 'success', data: appointments });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch appointments' });
        }
    };

    // 3. Get appointments for a specific business
    getBusinessAppointments = async (req, res) => {
        try {
            const { businessId } = req.params;
            const { status, date } = req.query;

            if (!mongoose.Types.ObjectId.isValid(businessId)) {
                return res.status(400).json({ status: 'error', message: 'Invalid business ID format' });
            }

            // Verify user has permission (RBAC kept intact)
            if (req.user?.role !== 'admin' && req.user?.businessId !== businessId) {
                return res.status(403).json({ status: 'error', message: 'Not authorized to view these appointments' });
            }

            const appointments = await AppointmentService.getAppointmentsByBusiness(businessId, { status, date });

            res.status(200).json({ status: 'success', data: appointments });
        } catch (error) {
            console.error('Error fetching business appointments:', error);
            res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch business appointments' });
        }
    };

    // 4. Get customer's specific appointments
    getCustomerAppointments = async (req, res) => {
        try {
            const customerEmail = req.user?.email || req.query.email;
            
            if (!customerEmail) {
                return res.status(400).json({ status: 'error', message: 'Customer email is required' });
            }

            const appointments = await AppointmentService.getAppointmentsByCustomer(customerEmail);
            
            res.status(200).json({ status: 'success', data: appointments });
        } catch (error) {
            console.error('Error fetching customer appointments:', error);
            res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch customer appointments' });
        }
    };

    // 5. Get upcoming appointments only
    getUpcomingAppointments = async (req, res) => {
        try {
            const identifier = req.user?.email || req.user?.id;
            const role = req.user?.role || 'customer';

            const appointments = await AppointmentService.getUpcomingAppointments(identifier, role);

            res.status(200).json({ status: 'success', data: appointments });
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch upcoming appointments' });
        }
    };

    // 6. Get a single appointment by ID
    getAppointmentById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ status: 'error', message: 'Invalid appointment ID format' });
            }

            const appointment = await AppointmentService.getAppointmentById(id);
            
            if (!appointment) {
                return res.status(404).json({ status: 'error', message: 'Appointment not found' });
            }

            // Check authorization
            const userEmail = req.user?.email;
            const userRole = req.user?.role;
            const userBusinessId = req.user?.businessId;

            if (
                userRole !== 'admin' && 
                appointment.customerDetails.email !== userEmail &&
                appointment.businessId.toString() !== userBusinessId
            ) {
                return res.status(403).json({ status: 'error', message: 'Not authorized to view this appointment' });
            }

            res.status(200).json({ status: 'success', data: appointment });
        } catch (error) {
            console.error('Error fetching appointment:', error);
            res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch appointment' });
        }
    };

    // 7. Update appointment
    updateAppointment = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ status: 'error', message: 'Invalid appointment ID format' });
            }

            const appointment = await AppointmentService.updateAppointment(id, updateData);

            if (!appointment) {
                return res.status(404).json({ status: 'error', message: 'Appointment not found' });
            }

            res.status(200).json({ status: 'success', message: 'Appointment updated successfully', data: appointment });
        } catch (error) {
            console.error('Error updating appointment:', error);
            res.status(400).json({ status: 'error', message: error.message || 'Failed to update appointment' });
        }
    };

    // 8. Cancel appointment
    cancelAppointment = async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ status: 'error', message: 'Invalid appointment ID format' });
            }

            const appointment = await AppointmentService.cancelAppointment(id);

            if (!appointment) {
                return res.status(404).json({ status: 'error', message: 'Appointment not found' });
            }

            res.status(200).json({ status: 'success', message: 'Appointment cancelled successfully', data: appointment });
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            res.status(400).json({ status: 'error', message: error.message || 'Failed to cancel appointment' });
        }
    };

    // 9. Get available slots
    getAvailableSlots = async (req, res) => {
        try {
            const { businessId, serviceId, date } = req.query;

            if (!businessId || !serviceId || !date) {
                return res.status(400).json({ status: 'error', message: 'Business ID, service ID, and date are required' });
            }

            const slots = await AppointmentService.getAvailableSlots(businessId, serviceId, date);

            res.status(200).json({ status: 'success', data: slots });
        } catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(400).json({ status: 'error', message: error.message || 'Failed to fetch available slots' });
        }
    };
}

// Export the single instantiated controller
module.exports = new AppointmentController();