// scripts/addHealthBusinesses.js
require('dotenv').config();
const mongoose = require('mongoose');
const HealthFacility = require('../src/models/healthFacilityModel'); // Update the model import

const healthBusinesses = [
    {
        name: 'CMC Hospital',
        type: 'hospital',
        location: {
            type: 'Point',
            coordinates: [79.1325, 12.9165] // [longitude, latitude] for Vellore
        },
        address: {
            street: 'Ida Scudder Road',
            city: 'Vellore',
            state: 'Tamil Nadu',
            zipCode: '632004',
            country: 'India'
        },
        contact: {
            phone: '+91 416 228 2010',
            email: 'contact@cmch-vellore.edu',
            website: 'https://www.cmch-vellore.edu'
        },
        rating: 4.8,
        totalRatings: 1500,
        services: ['General Consultation', 'Emergency Care', 'Surgery', 'Cardiology'],
        openingHours: {
            monday: { open: '00:00', close: '23:59' },
            tuesday: { open: '00:00', close: '23:59' },
            wednesday: { open: '00:00', close: '23:59' },
            thursday: { open: '00:00', close: '23:59' },
            friday: { open: '00:00', close: '23:59' },
            saturday: { open: '00:00', close: '23:59' },
            sunday: { open: '00:00', close: '23:59' }
        },
        images: [
            {
                url: '/images/cmc-hospital.jpg',
                alt: 'CMC Hospital'
            }
        ],
        specialFeatures: ['24/7 Emergency', 'ICU', 'Multi-Specialty'],
        isVerified: true,
        isActive: true
    },
    {
        name: 'Apollo Clinic',
        type: 'clinic',
        location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716] // [longitude, latitude] for Bangalore
        },
        address: {
            street: '100 Feet Road, Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560038',
            country: 'India'
        },
        contact: {
            phone: '+91 80 2525 5555',
            email: 'contact@apolloclinic.com',
            website: 'www.apolloclinic.com'
        },
        rating: 4.5,
        totalRatings: 800,
        services: ['General Medicine', 'Pediatrics', 'Dental Care', 'Diagnostics'],
        openingHours: {
            monday: { open: '09:00', close: '21:00' },
            tuesday: { open: '09:00', close: '21:00' },
            wednesday: { open: '09:00', close: '21:00' },
            thursday: { open: '09:00', close: '21:00' },
            friday: { open: '09:00', close: '21:00' },
            saturday: { open: '09:00', close: '21:00' },
            sunday: { open: '10:00', close: '18:00' }
        },
        images: [
            {
                url: '/images/apollo-clinic.jpg',
                alt: 'Apollo Clinic'
            }
        ],
        specialFeatures: ['Lab Services', 'Pharmacy', 'Consultation'],
        isVerified: true,
        isActive: true
    },
    {
        name: 'Max Lab',
        type: 'lab',
        location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139] // [longitude, latitude] for Delhi
        },
        address: {
            street: 'Lajpat Nagar',
            city: 'New Delhi',
            state: 'Delhi',
            zipCode: '110024',
            country: 'India'
        },
        contact: {
            phone: '+91 11 4444 7777',
            email: 'info@maxlab.com',
            website: 'www.maxlab.com'
        },
        rating: 4.3,
        totalRatings: 500,
        services: ['Blood Tests', 'X-Ray', 'MRI', 'CT Scan'],
        openingHours: {
            monday: { open: '07:00', close: '20:00' },
            tuesday: { open: '07:00', close: '20:00' },
            wednesday: { open: '07:00', close: '20:00' },
            thursday: { open: '07:00', close: '20:00' },
            friday: { open: '07:00', close: '20:00' },
            saturday: { open: '07:00', close: '20:00' },
            sunday: { open: '08:00', close: '17:00' }
        },
        images: [
            {
                url: '/images/max-lab.jpg',
                alt: 'Max Lab'
            }
        ],
        specialFeatures: ['Home Collection', 'Online Reports', 'Quick Results'],
        isVerified: true,
        isActive: true
    },
    {
        name: 'MedPlus Pharmacy',
        type: 'pharmacy',
        location: {
            type: 'Point',
            coordinates: [78.4867, 17.3850] // [longitude, latitude] for Hyderabad
        },
        address: {
            street: 'Banjara Hills Road No. 12',
            city: 'Hyderabad',
            state: 'Telangana',
            zipCode: '500034',
            country: 'India'
        },
        contact: {
            phone: '+91 40 3333 1111',
            email: 'care@medplus.com',
            website: 'www.medplus.com'
        },
        rating: 4.4,
        totalRatings: 300,
        services: ['Medicine Delivery', 'Healthcare Products', 'Prescription Filling'],
        openingHours: {
            monday: { open: '08:00', close: '23:00' },
            tuesday: { open: '08:00', close: '23:00' },
            wednesday: { open: '08:00', close: '23:00' },
            thursday: { open: '08:00', close: '23:00' },
            friday: { open: '08:00', close: '23:00' },
            saturday: { open: '08:00', close: '23:00' },
            sunday: { open: '09:00', close: '22:00' }
        },
        images: [
            {
                url: '/images/medplus.jpg',
                alt: 'MedPlus Pharmacy'
            }
        ],
        specialFeatures: ['24/7 Delivery', 'Online Orders', 'Healthcare Products'],
        isVerified: true,
        isActive: true
    }
];

async function addHealthBusinesses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional)
        // await HealthFacility.deleteMany({});
        // console.log('Cleared existing data');

        for (const business of healthBusinesses) {
            const existingBusiness = await HealthFacility.findOne({ 
                name: business.name,
                'address.city': business.address.city 
            });

            if (existingBusiness) {
                console.log(`${business.name} already exists`);
                continue;
            }

            const newBusiness = new HealthFacility(business);
            await newBusiness.save();
            console.log(`${business.name} added successfully`);
        }

        console.log('All businesses added successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addHealthBusinesses();