// src/controllers/bookingController.js
const Booking = require('../models/bookingModel');
const HealthFacility = require('../models/healthFacilityModel');

exports.createBooking = async (req, res) => {
    try {
        const {
            facilityId,
            service,
            date,
            time,
            name,
            phone,
            email
        } = req.body;

        const booking = await Booking.create({
            userId: req.user._id, // From auth middleware
            facilityId,
            service,
            date,
            time,
            name,
            phone,
            email
        });

        res.status(201).json({
            status: 'success',
            data: booking
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create booking'
        });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.user._id,
            status: { $ne: 'cancelled' }
        })
        .populate('facilityId', 'name address')
        .sort({ date: 1, time: 1 });

        res.status(200).json({
            status: 'success',
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch bookings'
        });
    }
};