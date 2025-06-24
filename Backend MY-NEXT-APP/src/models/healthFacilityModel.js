// src/models/healthFacilityModel.js
const mongoose = require('mongoose');

// Sub-schemas
const openingHoursSchema = new mongoose.Schema({
    open: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use HH:MM`
        }
    },
    close: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use HH:MM`
        }
    }
}, { _id: false });

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'India'
    }
}, { _id: false });

const contactSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^\+?[\d\s-]{10,}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    website: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Website is optional
                return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v);
            },
            message: props => `${props.value} is not a valid website URL!`
        }
    }
}, { _id: false });

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(http|https):\/\/[^ "]+$/.test(v) || v.startsWith('/');
            },
            message: props => `${props.value} is not a valid image URL!`
        }
    },
    alt: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

// Main schema
const healthFacilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Facility name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    type: {
        type: String,
        required: [true, 'Facility type is required'],
        enum: {
            values: ['hospital', 'clinic', 'lab', 'pharmacy'],
            message: '{VALUE} is not a valid facility type'
        },
        lowercase: true
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            required: true,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: [true, 'Coordinates are required'],
            validate: {
                validator: function(v) {
                    return v.length === 2 && 
                           v[0] >= -180 && v[0] <= 180 && 
                           v[1] >= -90 && v[1] <= 90;
                },
                message: 'Invalid coordinates! [longitude, latitude] required'
            }
        }
    },
    address: {
        type: addressSchema,
        required: true
    },
    contact: {
        type: contactSchema,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5']
    },
    totalRatings: {
        type: Number,
        default: 0,
        min: [0, 'Total ratings cannot be negative']
    },
    services: [{
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Service name must be at least 3 characters long']
    }],
    openingHours: {
        monday: { type: openingHoursSchema, required: true },
        tuesday: { type: openingHoursSchema, required: true },
        wednesday: { type: openingHoursSchema, required: true },
        thursday: { type: openingHoursSchema, required: true },
        friday: { type: openingHoursSchema, required: true },
        saturday: { type: openingHoursSchema, required: true },
        sunday: { type: openingHoursSchema, required: true }
    },
    images: {
        type: [imageSchema],
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one image is required'
        }
    },
    specialFeatures: [{
        type: String,
        trim: true
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
healthFacilitySchema.index({ location: '2dsphere' });
healthFacilitySchema.index({ name: 'text', 'address.city': 'text' });
healthFacilitySchema.index({ type: 1 });
healthFacilitySchema.index({ isActive: 1, isVerified: 1 });

// Virtual for formatted address
healthFacilitySchema.virtual('fullAddress').get(function() {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Method to check if facility is currently open
healthFacilitySchema.methods.isOpen = function() {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);
    
    const hours = this.openingHours[currentDay];
    if (!hours) return false;
    
    return currentTime >= hours.open && currentTime <= hours.close;
};

// Static method to find nearby facilities
healthFacilitySchema.statics.findNearby = function(coords, maxDistance = 5000) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: coords
                },
                $maxDistance: maxDistance
            }
        },
        isActive: true
    });
};

// Static method to find by type
healthFacilitySchema.statics.findByType = function(type) {
    return this.find({ 
        type: type.toLowerCase(),
        isActive: true 
    });
};

// Pre-save middleware
healthFacilitySchema.pre('save', function(next) {
    // Ensure services array is unique
    if (this.services) {
        this.services = [...new Set(this.services)];
    }
    
    // Ensure specialFeatures array is unique
    if (this.specialFeatures) {
        this.specialFeatures = [...new Set(this.specialFeatures)];
    }
    
    next();
});

// Create the model
const HealthFacility = mongoose.model('HealthFacility', healthFacilitySchema);

module.exports = HealthFacility;