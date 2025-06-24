// src/controllers/healthFacilityController.js
const HealthFacility = require('../models/healthFacilityModel');

// Helper function for error handling
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error('Error:', err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    });
};

// Get all health facilities with pagination and filters
exports.getAllFacilities = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const queryObj = { isActive: true };
    
    if (req.query.type) {
        queryObj.type = req.query.type;
    }
    
    if (req.query.city) {
        queryObj['address.city'] = new RegExp(req.query.city, 'i');
    }
    
    if (req.query.minRating) {
        queryObj.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Execute query with pagination
    const [facilities, total] = await Promise.all([
        HealthFacility.find(queryObj)
            .select('-__v')
            .sort({ rating: -1 })
            .skip(skip)
            .limit(limit),
        HealthFacility.countDocuments(queryObj)
    ]);

    console.log(`Found ${facilities.length} facilities (page ${page}/${Math.ceil(total/limit)})`);

    res.status(200).json({
        status: 'success',
        results: facilities.length,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            resultsPerPage: limit
        },
        data: facilities
    });
});

// Get single facility with detailed information
exports.getFacilityById = catchAsync(async (req, res) => {
    const facility = await HealthFacility.findOne({
        _id: req.params.id,
        isActive: true
    }).select('-__v');

    if (!facility) {
        return res.status(404).json({
            status: 'error',
            message: 'Facility not found'
        });
    }

    // Check if facility is currently open
    const isCurrentlyOpen = facility.isOpen(new Date());

    res.status(200).json({
        status: 'success',
        data: {
            ...facility.toObject(),
            isCurrentlyOpen
        }
    });
});

// Get facility services with categories
exports.getFacilityServices = catchAsync(async (req, res) => {
    const facility = await HealthFacility.findById(req.params.id)
        .select('services name')
        .lean();

    if (!facility) {
        return res.status(404).json({
            status: 'error',
            message: 'Facility not found'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            facilityName: facility.name,
            services: facility.services
        }
    });
});

// Advanced search with multiple criteria
exports.searchFacilities = catchAsync(async (req, res) => {
    const {
        query,
        type,
        city,
        minRating,
        maxDistance,
        lat,
        lng
    } = req.query;

    let searchQuery = { isActive: true };

    // Text search
    if (query) {
        searchQuery.$or = [
            { name: { $regex: query, $options: 'i' } },
            { 'address.city': { $regex: query, $options: 'i' } },
            { services: { $regex: query, $options: 'i' } }
        ];
    }

    // Type filter
    if (type) {
        searchQuery.type = type;
    }

    // City filter
    if (city) {
        searchQuery['address.city'] = new RegExp(city, 'i');
    }

    // Rating filter
    if (minRating) {
        searchQuery.rating = { $gte: parseFloat(minRating) };
    }

    // Geospatial search
    if (lat && lng && maxDistance) {
        searchQuery.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: parseInt(maxDistance) * 1000 // Convert km to meters
            }
        };
    }

    const facilities = await HealthFacility.find(searchQuery)
        .select('-__v')
        .sort({ rating: -1 });

    res.status(200).json({
        status: 'success',
        results: facilities.length,
        data: facilities
    });
});

// Create new facility
exports.createFacility = catchAsync(async (req, res) => {
    const facility = await HealthFacility.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: facility
    });
});

// Update facility
exports.updateFacility = catchAsync(async (req, res) => {
    const facility = await HealthFacility.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!facility) {
        return res.status(404).json({
            status: 'error',
            message: 'Facility not found'
        });
    }

    res.status(200).json({
        status: 'success',
        data: facility
    });
});

// Delete facility (soft delete)
exports.deleteFacility = catchAsync(async (req, res) => {
    const facility = await HealthFacility.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!facility) {
        return res.status(404).json({
            status: 'error',
            message: 'Facility not found'
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Facility successfully deactivated'
    });
});

// Get nearby facilities
exports.getNearbyFacilities = catchAsync(async (req, res) => {
    const { lat, lng, distance = 5 } = req.query; // distance in km

    if (!lat || !lng) {
        return res.status(400).json({
            status: 'error',
            message: 'Please provide latitude and longitude'
        });
    }

    const facilities = await HealthFacility.findNearby(
        [parseFloat(lng), parseFloat(lat)],
        distance * 1000 // Convert km to meters
    );

    res.status(200).json({
        status: 'success',
        results: facilities.length,
        data: facilities
    });
});

// Test endpoint with enhanced information
exports.test = catchAsync(async (req, res) => {
    const stats = await HealthFacility.aggregate([
        {
            $group: {
                _id: null,
                totalFacilities: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                facilitiesByType: {
                    $push: {
                        type: '$type',
                        count: 1
                    }
                }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        message: 'Health facility controller is working',
        stats: stats[0] || {},
        timestamp: new Date().toISOString()
    });
});