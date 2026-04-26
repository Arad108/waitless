// src/models/appointmentModel.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business', // NOW REFERENCES THE UNIFIED BASE CLASS
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Handles registered users
    },
    customerDetails: { // Handles walk-ins / unregistered users
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    status: {
        type: String,
        // Added 'in_progress' and 'no_show' for better queue management
        enum: ['pending', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    appointmentTime: {
        type: Date,
        required: true
    },
    appointmentEndTime: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'walk-in', 'phone'],
            default: 'web'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        reminderSent: {
            type: Boolean,
            default: false
        },
        lastReminderDate: {
            type: Date
        }
    }
}, {
    timestamps: true 
});

// ==========================================
// YOUR ORIGINAL INDEXES, VIRTUALS & METHODS
// ==========================================

// Indexes for better query performance
appointmentSchema.index({ businessId: 1, appointmentTime: 1 });
appointmentSchema.index({ 'customerDetails.email': 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ userId: 1 });

// Virtual for appointment duration
appointmentSchema.virtual('duration').get(function() {
    return (this.appointmentEndTime - this.appointmentTime) / (1000 * 60); 
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
    const now = new Date();
    const appointmentDate = new Date(this.appointmentTime);
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
    return hoursUntilAppointment > 24; 
};

// Pre-save middleware to set appointmentEndTime based on Service duration
appointmentSchema.pre('save', async function(next) {
    if (this.isModified('appointmentTime') || !this.appointmentEndTime) {
        try {
            const Service = mongoose.model('Service');
            const service = await Service.findById(this.serviceId);
            if (service) {
                const endTime = new Date(this.appointmentTime);
                endTime.setMinutes(endTime.getMinutes() + (service.durationMinutes || 60));
                this.appointmentEndTime = endTime;
            }
        } catch (error) {
            next(error);
        }
    }
    next();
});

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcoming = function(query = {}) {
    return this.find({
        ...query,
        appointmentTime: { $gt: new Date() },
        status: { $nin: ['cancelled', 'completed', 'no_show'] }
    }).sort({ appointmentTime: 1 });
};

// Static method to find scheduling conflicts
appointmentSchema.statics.findConflicts = function(businessId, startTime, endTime, excludeId = null) {
    const query = {
        businessId,
        status: { $ne: 'cancelled' },
        $or: [
            { appointmentTime: { $lt: endTime, $gte: startTime } },
            { appointmentEndTime: { $gt: startTime, $lte: endTime } }
        ]
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    return this.find(query);
};

module.exports = mongoose.model('Appointment', appointmentSchema);