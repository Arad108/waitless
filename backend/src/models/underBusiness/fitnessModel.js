// src/models/fitnessModel.js
const mongoose = require('mongoose');
const Business = require('../businessModel');

const fitnessSchema = new mongoose.Schema({
    facilityType: {
        type: String,
        required: true,
        enum: ['gym', 'yoga_studio', 'sports_court', 'swimming_pool', 'other'],
        lowercase: true
    },
    hasLockerRooms: {
        type: Boolean,
        default: true
    },
    equipmentProvided: {
        type: Boolean,
        default: true
    },
    requiresMembership: {
        type: Boolean,
        default: false // True if walk-ins aren't allowed
    }
});

module.exports = Business.discriminator('Fitness', fitnessSchema);