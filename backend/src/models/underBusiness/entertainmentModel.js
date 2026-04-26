// src/models/entertainmentModel.js
const mongoose = require('mongoose');
const Business = require('../businessModel');

const entertainmentSchema = new mongoose.Schema({
    facilityType: {
        type: String,
        required: true,
        enum: ['gaming_zone', 'bowling', 'theme_park', 'escape_room'],
        lowercase: true
    },
    ageRestriction: {
        type: Number,
        default: 0 // 0 means no restriction
    },
    maxGroupSize: {
        type: Number,
        default: 1
    },
    waiverRequired: {
        type: Boolean,
        default: false
    }
});

module.exports = Business.discriminator('Entertainment', entertainmentSchema);