// models/queueModel.js
const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    business_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'in_progress', 'completed', 'cancelled'],
        default: 'waiting'
    },
    estimated_wait_time: {
        type: Number, // in minutes
        required: true
    },
    actual_wait_time: {
        type: Number
    },
    start_time: {
        type: Date
    },
    end_time: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    }
});

// Update the updated_at timestamp before saving
queueSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

module.exports = mongoose.model('Queue', queueSchema);