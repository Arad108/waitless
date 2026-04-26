// src/models/businessModel.js
const mongoose = require('mongoose');

const openingHoursSchema = new mongoose.Schema({
    open: {
        type: String,
        validate: {
            validator: v => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: props => `${props.value} is not a valid time format! Use HH:MM`
        }
    },
    close: {
        type: String,
        validate: {
            validator: v => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: props => `${props.value} is not a valid time format! Use HH:MM`
        }
    }
}, { _id: false });

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' }
}, { _id: false });

const contactSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        validate: {
            validator: v => /^\+?[\d\s-]{10,}$/.test(v),
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: v => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v),
            message: props => `${props.value} is not a valid email address!`
        }
    },
    website: {
        type: String,
        trim: true,
        validate: {
            validator: v => !v || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v),
            message: props => `${props.value} is not a valid website URL!`
        }
    }
}, { _id: false });

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        validate: {
            validator: v => /^(http|https):\/\/[^ "]+$/.test(v) || v.startsWith('/'),
            message: props => `${props.value} is not a valid image URL!`
        }
    },
    alt: { type: String, required: true, trim: true }
}, { _id: false });


const baseOptions = {
    discriminatorKey: 'category', // Distinguishes between Health, Gaming, etc.
    collection: 'businesses',     // All subclasses go into the same database collection
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
};


const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: {
            type: [Number],
            validate: {
                validator: v => v && v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
                message: 'Invalid coordinates! [longitude, latitude] required'
            }
        }
    },
    address: { type: addressSchema, required: true },
    contact: { type: contactSchema, required: true },
    openingHours: {
        monday: { type: openingHoursSchema },
        tuesday: { type: openingHoursSchema },
        wednesday: { type: openingHoursSchema },
        thursday: { type: openingHoursSchema },
        friday: { type: openingHoursSchema },
        saturday: { type: openingHoursSchema },
        sunday: { type: openingHoursSchema }
    },
    images: { type: [imageSchema] },
    services: [{ type: String, trim: true }], // Generalized services array
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, baseOptions);


// Indexes for searching
businessSchema.index({ location: '2dsphere' });
businessSchema.index({ name: 'text', 'address.city': 'text' });
businessSchema.index({ isActive: 1, isVerified: 1 });

// Virtuals
businessSchema.virtual('fullAddress').get(function() {
    if (!this.address) return '';
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Methods
businessSchema.methods.isOpen = function() {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (!this.openingHours || !this.openingHours[currentDay]) return false;
    const hours = this.openingHours[currentDay];
    
    return currentTime >= hours.open && currentTime <= hours.close;
};

// Statics
businessSchema.statics.findNearby = function(coords, maxDistance = 5000) {
    return this.find({
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: coords },
                $maxDistance: maxDistance
            }
        },
        isActive: true
    });
};

// Pre-save middleware for cleaning up arrays
businessSchema.pre('save', function(next) {
    if (this.services && this.services.length > 0) {
        this.services = [...new Set(this.services)];
    }
    next();
});

module.exports = mongoose.model('Business', businessSchema);