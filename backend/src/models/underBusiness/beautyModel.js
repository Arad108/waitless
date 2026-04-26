// src/models/beautyModel.js
const mongoose = require('mongoose');
const Business = require('../businessModel');

const beautySchema = new mongoose.Schema({
    facilityType: {
        type: String,
        required: true,
        enum: ['salon', 'barbershop', 'spa', 'massage', 'other'],
        lowercase: true
    },
    acceptedGenders: {
        type: String,
        enum: ['unisex', 'male', 'female'],
        default: 'unisex'
    },
    requiresPatchTest: {
        type: Boolean,
        default: false // Useful for hair dye/chemical services
    }
});

module.exports = Business.discriminator('Beauty', beautySchema);