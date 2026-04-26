// src/models/healthFacilityModel.js
const mongoose = require('mongoose');
const Business = require('../businessModel'); 

const healthFacilitySchema = new mongoose.Schema({
    facilityType: {
        type: String,
        required: [true, 'Facility type is required'],
        enum: {
            values: ['hospital', 'clinic', 'lab', 'pharmacy', 'other'],
            message: '{VALUE} is not a valid facility type'
        },
        lowercase: true
    },
    specialFeatures: [{
        type: String,
        trim: true
    }]
});

// Attach it to the Business model using a discriminator
const HealthFacility = Business.discriminator('HealthFacility', healthFacilitySchema);

module.exports = HealthFacility;