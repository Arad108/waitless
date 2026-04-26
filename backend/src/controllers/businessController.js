// src/controllers/businessController.js
const Business = require('../models/businessModel');

class BusinessController {
    static #instance;

    constructor() {
        if (BusinessController.#instance) {
            return BusinessController.#instance;
        }
        BusinessController.#instance = this;
    }

    // 1. Get all businesses with pagination and rich filters
    getAllBusinesses = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const queryObj = { isActive: true };
            
            if (req.query.category) queryObj.category = req.query.category;
            if (req.query.city) queryObj['address.city'] = new RegExp(req.query.city, 'i');
            if (req.query.minRating) queryObj.rating = { $gte: parseFloat(req.query.minRating) };

            const [businesses, total] = await Promise.all([
                Business.find(queryObj)
                    .select('-__v')
                    .populate('ownerId', 'name email')
                    .sort({ rating: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Business.countDocuments(queryObj)
            ]);

            res.status(200).json({
                status: 'success',
                results: businesses.length,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalResults: total,
                    resultsPerPage: limit
                },
                data: businesses
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    // 2. Get single business with live "isOpen" check
    getBusinessById = async (req, res) => {
        try {
            const business = await Business.findOne({ _id: req.params.id, isActive: true })
                .populate('ownerId', 'name email')
                .select('-__v');

            if (!business) {
                return res.status(404).json({ status: 'error', message: 'Business not found' });
            }

            const isCurrentlyOpen = business.isOpen();

            res.status(200).json({
                status: 'success',
                data: {
                    ...business.toObject(),
                    isCurrentlyOpen
                }
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    // 3. Advanced Geospatial & Text Search
    searchBusinesses = async (req, res) => {
        try {
            const { query, category, city, minRating, maxDistance, lat, lng } = req.query;
            let searchQuery = { isActive: true };

            if (query) {
                searchQuery.$or = [
                    { name: { $regex: query, $options: 'i' } },
                    { 'address.city': { $regex: query, $options: 'i' } },
                    { services: { $regex: query, $options: 'i' } }
                ];
            }

            if (category) searchQuery.category = category;
            if (city) searchQuery['address.city'] = new RegExp(city, 'i');
            if (minRating) searchQuery.rating = { $gte: parseFloat(minRating) };

            if (lat && lng && maxDistance) {
                searchQuery.location = {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: parseInt(maxDistance) * 1000 
                    }
                };
            }

            const businesses = await Business.find(searchQuery).select('-__v').sort({ rating: -1 });

            res.status(200).json({ status: 'success', results: businesses.length, data: businesses });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    // 4. Create business
    createBusiness = async (req, res) => {
        try {
            const newBusiness = new Business({
                ...req.body,
                ownerId: req.user._id
            });

            const savedBusiness = await newBusiness.save();
            res.status(201).json({ status: 'success', data: savedBusiness });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // 5. Update business
    updateBusiness = async (req, res) => {
        try {
            const updatedBusiness = await Business.findByIdAndUpdate(
                req.params.id,
                { ...req.body }, 
                { new: true, runValidators: true }
            );

            if (!updatedBusiness) return res.status(404).json({ status: 'error', message: 'Business not found' });
            res.status(200).json({ status: 'success', data: updatedBusiness });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // 6. Soft Delete Business
    deleteBusiness = async (req, res) => {
        try {
            const business = await Business.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            );

            if (!business) return res.status(404).json({ status: 'error', message: 'Business not found' });
            res.status(200).json({ status: 'success', message: 'Business successfully deactivated' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    // 7. Get businesses by specific owner
    getBusinessesByOwner = async (req, res) => {
        try {
            const businesses = await Business.find({ ownerId: req.params.ownerId, isActive: true })
                .sort({ createdAt: -1 });
            res.status(200).json({ status: 'success', data: businesses });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    // 8. Toggle Business Status (RESTORED FROM ORIGINAL FILE)
    toggleBusinessStatus = async (req, res) => {
        try {
            const business = await Business.findById(req.params.id);
            if (!business) return res.status(404).json({ status: 'error', message: 'Business not found' });
            
            business.isActive = !business.isActive;
            await business.save();

            res.status(200).json({
                status: 'success',
                message: `Business ${business.isActive ? 'activated' : 'deactivated'} successfully`,
                data: business
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    // 9. Aggregation / Stats
    getSystemStats = async (req, res) => {
        try {
            const stats = await Business.aggregate([
                {
                    $group: {
                        _id: null,
                        totalBusinesses: { $sum: 1 },
                        averageRating: { $avg: '$rating' },
                        businessesByCategory: {
                            $push: { category: '$category', count: 1 }
                        }
                    }
                }
            ]);
            res.status(200).json({ status: 'success', data: stats[0] || {} });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };
}

module.exports = new BusinessController();