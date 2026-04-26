// src/models/queueModel.js
const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    // 1. Core References
    business_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business', // Links to our unified Business model
        required: true
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    
    // 2. User/Customer Identification
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null if it is a guest walk-in
    },
    customer_details: { 
        // Crucial for receptionist walk-ins who don't have the app downloaded
        name: { type: String },
        phone: { type: String }
    },

    // 3. Queue State & Rules
    status: {
        type: String,
        enum: ['waiting', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'waiting'
    },
    priority_pass: {
        type: Boolean,
        default: false // Pushes the user to the front of the line (VIPs/Emergencies)
    },
    estimated_wait_time: {
        type: Number, // Stored in minutes
        required: true
    },

    // 4. Analytics Timestamps (Used by the updateAnalytics hook)
    start_time: {
        type: Date // Populated when status -> 'in_progress'
    },
    end_time: {
        type: Date // Populated when status -> 'completed'
    }
}, {
    // Mongoose will automatically manage created_at and updated_at
    // We explicitly map them to snake_case to match your Service layer logic
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// ==========================================
// PERFORMANCE INDEXES
// ==========================================

// 1. The "Active Queue" Index: 
// Makes QueueService.getActiveQueue() incredibly fast by pre-sorting 
// first by priority, then by whoever joined first.
queueSchema.index({ business_id: 1, status: 1, priority_pass: -1, created_at: 1 });

// 2. The "Queue Length" Index:
// Makes QueueService.calculateWaitTime() instant when counting waiting users.
queueSchema.index({ business_id: 1, status: 1 });

// 3. The "User History" Index:
// For when a user wants to see their own queue history on their profile.
queueSchema.index({ user_id: 1 });

module.exports = mongoose.model('Queue', queueSchema);