// controllers/businessController.js
const Business = require('../models/businessModel');

// Get all businesses
const getAllBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find()
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(businesses);
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching businesses',
            error: error.message 
        });
    }
};

// Get business by ID
const getBusinessById = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id)
            .populate('ownerId', 'name email');

        if (!business) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Business not found' 
            });
        }

        res.status(200).json(business);
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching business',
            error: error.message 
        });
    }
};

// Create business
const createBusiness = async (req, res) => {
    try {
        const newBusiness = new Business({
            ...req.body,
            ownerId: req.user._id
        });

        const savedBusiness = await newBusiness.save();
        const populatedBusiness = await Business.findById(savedBusiness._id)
            .populate('ownerId', 'name email');

        res.status(201).json({
            status: 'success',
            message: 'Business created successfully',
            business: populatedBusiness
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error creating business',
            error: error.message 
        });
    }
};

// Update business
const updateBusiness = async (req, res) => {
    try {
        const updatedBusiness = await Business.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('ownerId', 'name email');

        if (!updatedBusiness) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Business not found' 
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Business updated successfully',
            business: updatedBusiness
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error updating business',
            error: error.message 
        });
    }
};

// Delete business
const deleteBusiness = async (req, res) => {
    try {
        const deletedBusiness = await Business.findByIdAndDelete(req.params.id);

        if (!deletedBusiness) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Business not found' 
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Business deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error deleting business',
            error: error.message 
        });
    }
};

// Get businesses by owner
const getBusinessesByOwner = async (req, res) => {
    try {
        const businesses = await Business.find({ ownerId: req.params.ownerId })
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(businesses);
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching businesses',
            error: error.message 
        });
    }
};

// Toggle business status
const toggleBusinessStatus = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        business.isActive = !business.isActive;
        await business.save();

        res.status(200).json({
            status: 'success',
            message: `Business ${business.isActive ? 'activated' : 'deactivated'} successfully`,
            business
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error toggling business status',
            error: error.message 
        });
    }
};

module.exports = {
    getAllBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessesByOwner,
    toggleBusinessStatus
};