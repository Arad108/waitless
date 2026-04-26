// src/models/retailModel.js
const mongoose = require('mongoose');
const Business = require('../businessModel');

const retailSchema = new mongoose.Schema({
    facilityType: {
        type: String,
        required: true,
        enum: ['boutique', 'tech_support', 'auto_service', 'tailor', 'other'],
        lowercase: true
    },
    hasFittingRooms: {
        type: Boolean,
        default: false
    },
    estimatedServiceTimeVariability: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium' // Tech repairs might take wildly different times
    }
});

module.exports = Business.discriminator('Retail', retailSchema);