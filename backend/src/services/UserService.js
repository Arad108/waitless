// src/services/UserService.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

class UserService {
    static generateToken(id, role) {
        return jwt.sign(
            { id, role }, 
            process.env.JWT_SECRET || 'waitless-dev-secret', 
            { expiresIn: '30d' }
        );
    }

    static async createUser(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) throw new Error('Email already exists');

        const newUser = await User.create({
            email: userData.email,
            password: userData.password, 
            full_name: userData.full_name,
            role: userData.role || 'customer',
            business_details: userData.business_details,
            preferences: userData.preferences
        });

        const token = this.generateToken(newUser._id, newUser.role);
        
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return { user: userResponse, token };
    }

    static async loginUser(email, password) {
        // Only look for active users!
        const user = await User.findOne({ email, isActive: true }).select('+password');
        if (!user) throw new Error('Invalid email or password');

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) throw new Error('Invalid email or password');

        const token = this.generateToken(user._id, user.role);
        
        const userResponse = user.toObject();
        delete userResponse.password;

        return { user: userResponse, token };
    }

    static async getAllUsers() {
        // Only fetch active users
        return await User.find({ isActive: true }, { password: 0 });
    }

    static async getUserById(id) {
        const user = await User.findOne({ _id: id, isActive: true }, { password: 0 });
        if (!user) throw new Error('User not found');
        return user;
    }

    // --------------------------------------------------------
    // RESTORED FEATURE: Update User
    // --------------------------------------------------------
    static async updateUser(id, updateData) {
        const user = await User.findOne({ _id: id, isActive: true });
        if (!user) throw new Error('User not found');

        // Update fields safely
        if (updateData.email) user.email = updateData.email;
        if (updateData.full_name) user.full_name = updateData.full_name;
        if (updateData.role) user.role = updateData.role;
        if (updateData.business_details) user.business_details = updateData.business_details;
        if (updateData.preferences) user.preferences = updateData.preferences;
        if (updateData.profile_complete !== undefined) user.profile_complete = updateData.profile_complete;

        // If password is being updated, assigning it here triggers the pre-save hook to hash it!
        if (updateData.password) {
            user.password = updateData.password;
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;
        return userResponse;
    }

    // --------------------------------------------------------
    // RESTORED FEATURE: Delete User (Soft Delete)
    // --------------------------------------------------------
    static async deleteUser(id) {
        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        if (!user) throw new Error('User not found');
        return true;
    }
}

module.exports = UserService;