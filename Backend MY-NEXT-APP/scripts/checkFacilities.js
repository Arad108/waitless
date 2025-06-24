// scripts/checkFacilities.js
require('dotenv').config();
const mongoose = require('mongoose');
const HealthFacility = require('../src/models/healthFacilityModel');

async function checkFacilities() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const facilities = await HealthFacility.find();
        console.log(`Found ${facilities.length} facilities:`);
        facilities.forEach(f => {
            console.log(`- ${f.name} at [${f.location.coordinates}]`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFacilities();