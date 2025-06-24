// scripts/seedHealthFacilities.js
require('dotenv').config();
const mongoose = require('mongoose');

const healthFacilitySchema = new mongoose.Schema({
    name: String,
    type: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    rating: Number,
    totalRatings: Number,
    services: [String],
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    images: [{
        url: String,
        alt: String
    }],
    specialFeatures: [String],
    isVerified: Boolean,
    isActive: Boolean
});

const HealthFacility = mongoose.model('HealthFacility', healthFacilitySchema);

const healthFacilities = [
    {
        name: 'Christian Medical College (CMC) Hospital',
        type: 'hospital',
        location: {
            type: 'Point',
            coordinates: [79.1325, 12.9165]
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
            email: 'contact@cmcvellore.ac.in',
            website: 'https://www.cmch-vellore.edu'
        },
        rating: 4.8,
        totalRatings: 2500,
        services: [
            'Emergency Care',
            'General Medicine',
            'Cardiology',
            'Neurology',
            'Orthopedics',
            'Pediatrics',
            'Oncology',
            'Gastroenterology',
            'Nephrology',
            'Urology'
        ],
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
                url: '/images/cmc-vellore.jpg',
                alt: 'CMC Hospital Vellore Main Building'
            }
        ],
        specialFeatures: [
            '24/7 Emergency Services',
            'Multi-Specialty Hospital',
            'Advanced Diagnostic Services',
            'World-Class Medical Education',
            'Research Center',
            'Charitable Services',
            'International Patient Services',
            'Advanced ICU Facilities'
        ],
        isVerified: true,
        isActive: true
    },
    {
        name: 'Sri Ramachandra Hospital',
        type: 'hospital',
        location: {
            type: 'Point',
            coordinates: [80.1428, 13.0827]
        },
        address: {
            street: 'No.1 Ramachandra Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipCode: '600116',
            country: 'India'
        },
        contact: {
            phone: '+91 44 2476 8027',
            email: 'contact@sriramachandra.edu.in',
            website: 'https://www.sriramachandra.edu.in'
        },
        rating: 4.6,
        totalRatings: 1800,
        services: [
            'Emergency Services',
            'General Medicine',
            'Surgery',
            'Pediatrics',
            'Obstetrics & Gynecology',
            'Orthopedics',
            'ENT',
            'Ophthalmology'
        ],
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
                url: '/images/sri-ramachandra.jpg',
                alt: 'Sri Ramachandra Hospital'
            }
        ],
        specialFeatures: [
            '24/7 Emergency Care',
            'Super Specialty Hospital',
            'Medical College',
            'Research Institute',
            'Modern Equipment',
            'International Standards'
        ],
        isVerified: true,
        isActive: true
    },
    {
        name: 'Apollo Hospitals Chennai',
        type: 'hospital',
        location: {
            type: 'Point',
            coordinates: [80.2574, 13.0827]
        },
        address: {
            street: '21 Greams Lane, Off Greams Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipCode: '600006',
            country: 'India'
        },
        contact: {
            phone: '+91 44 2829 3333',
            email: 'info@apollohospitals.com',
            website: 'https://www.apollohospitals.com'
        },
        rating: 4.7,
        totalRatings: 2200,
        services: [
            'Emergency Care',
            'Cardiology',
            'Neurology',
            'Oncology',
            'Orthopedics',
            'Robotics Surgery',
            'Transplant Services',
            'Critical Care'
        ],
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
                url: '/images/apollo-chennai.jpg',
                alt: 'Apollo Hospitals Chennai'
            }
        ],
        specialFeatures: [
            'Multi-Specialty Care',
            'International Patients Services',
            'Advanced Technology',
            'Robotic Surgery',
            'Organ Transplantation',
            'Research & Innovation'
        ],
        isVerified: true,
        isActive: true
    }
];

async function seedHealthFacilities() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await HealthFacility.deleteMany({});
        console.log('Cleared existing health facilities');

        // Insert new facilities
        const result = await HealthFacility.insertMany(healthFacilities);
        console.log(`Successfully inserted ${result.length} health facilities`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedHealthFacilities();