// scripts/checkBusiness.js

const mongoose = require('mongoose');
require('dotenv').config();

async function checkBusiness() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const businessId = '678c28182cc5928378c623b9';
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        // Check business in collection
        const business = await mongoose.connection.db
            .collection('businesses')
            .findOne({ _id: new mongoose.Types.ObjectId(businessId) });

        if (business) {
            console.log('Business found:', {
                name: business.name,
                type: business.type,
                services: business.services.map(s => s.name)
            });
        } else {
            console.log('Business not found');
        }

    } catch (error) {
        console.error('Check error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkBusiness();