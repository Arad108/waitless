// src/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // standard standard is bcryptjs for Node

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false 
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['customer', 'business_owner', 'staff', 'admin'],
        default: 'customer'
    },
    business_details: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false // Hides this internal flag from API responses
    },
    preferences: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    profile_complete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Single point of hashing - only happens if password is changed/new
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);