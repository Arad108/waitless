// src/models/serviceModel.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    durationMinutes: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: String,
    isAvailable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Service', serviceSchema);