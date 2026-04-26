// src/models/publicServiceModel.js
const mongoose = require('mongoose');
const Business = require('../businessModel');

const publicServiceSchema = new mongoose.Schema({
    facilityType: {
        type: String,
        required: true,
        enum: ['bank', 'post_office', 'government', 'embassy', 'other'],
        lowercase: true
    },
    requiresIdVerification: {
        type: Boolean,
        default: true
    },
    expectedDocuments: [{
        type: String, // e.g., 'Passport', 'Utility Bill'
        trim: true
    }]
});

module.exports = Business.discriminator('PublicService', publicServiceSchema);