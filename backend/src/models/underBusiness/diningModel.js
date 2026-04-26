// src/models/diningModel.js
const mongoose = require('mongoose');
const Business = require('../businessModel');

const diningSchema = new mongoose.Schema({
    facilityType: {
        type: String,
        required: true,
        enum: ['restaurant', 'cafe', 'bar', 'food_truck', 'other'],
        lowercase: true
    },
    cuisineType: [{
        type: String,
        trim: true
    }],
    seatingCapacity: {
        type: Number,
        required: true
    },
    hasOutdoorSeating: {
        type: Boolean,
        default: false
    }
});

module.exports = Business.discriminator('Dining', diningSchema);