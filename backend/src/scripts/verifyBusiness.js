// scripts/verifyBusiness.js (Create this in a new 'scripts' folder)

const mongoose = require('mongoose');
require('dotenv').config();

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['health', 'food', 'beauty', 'fitness', 'education', 'gaming'],
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
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    services: [{
        name: String,
        description: String,
        price: Number,
        duration: Number,
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    images: [{
        url: String,
        alt: String
    }],
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Business = mongoose.model('Business', businessSchema);

async function verifyBusiness() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const businessId = '678c28182cc5928378c623b9';
        console.log('Searching for business:', businessId);

        // Try direct collection access
        const db = mongoose.connection.db;
        const businessesCollection = db.collection('businesses');
        
        const directResult = await businessesCollection.findOne({
            _id: new mongoose.Types.ObjectId(businessId)
        });
        console.log('Direct query result:', directResult);

        if (!directResult) {
            console.log('Business not found, creating it...');
            
            // Create a test business
            const newBusiness = {
                _id: new mongoose.Types.ObjectId(businessId),
                name: "Christian Medical College (CMC) Hospital",
                type: "health",
                address: {
                    street: "IDA Scudder Road",
                    city: "Vellore",
                    state: "Tamil Nadu",
                    zipCode: "632004",
                    country: "India"
                },
                contact: {
                    phone: "0416-2282010",
                    email: "cmc@example.com",
                    website: "www.cmch-vellore.edu"
                },
                rating: 4.8,
                totalRatings: 2500,
                services: [
                    {
                        name: "Emergency Care",
                        description: "24/7 Emergency medical services",
                        price: 1000,
                        duration: 60,
                        isAvailable: true
                    },
                    {
                        name: "General Medicine",
                        description: "General medical consultation",
                        price: 500,
                        duration: 30,
                        isAvailable: true
                    },
                    {
                        name: "Cardiology",
                        description: "Heart-related treatments",
                        price: 1500,
                        duration: 45,
                        isAvailable: true
                    }
                ],
                openingHours: {
                    monday: { open: "09:00", close: "18:00" },
                    tuesday: { open: "09:00", close: "18:00" },
                    wednesday: { open: "09:00", close: "18:00" },
                    thursday: { open: "09:00", close: "18:00" },
                    friday: { open: "09:00", close: "18:00" },
                    saturday: { open: "09:00", close: "14:00" },
                    sunday: { open: "09:00", close: "12:00" }
                },
                isVerified: true,
                isActive: true,
                ownerId: new mongoose.Types.ObjectId(), // Generate a random ObjectId for owner
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await businessesCollection.insertOne(newBusiness);
            console.log('Business created:', result.insertedId);

            // Verify the creation
            const createdBusiness = await businessesCollection.findOne({
                _id: new mongoose.Types.ObjectId(businessId)
            });
            console.log('Newly created business:', createdBusiness);
        } else {
            console.log('Business exists in database');
        }

    } catch (error) {
        console.error('Verification error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

verifyBusiness();

