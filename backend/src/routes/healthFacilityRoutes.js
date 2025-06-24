// src/routes/healthFacilityRoutes.js
const express = require('express');
const router = express.Router();
const healthFacilityController = require('../controllers/healthFacilityController');

// Test route
// GET /api/health-facilities/test
router.get('/test', healthFacilityController.test);

// Get all facilities
// GET /api/health-facilities
router.get('/', healthFacilityController.getAllFacilities);

// Search facilities
// GET /api/health-facilities/search?query=searchterm
router.get('/search', healthFacilityController.searchFacilities);

// Get specific facility by ID
// GET /api/health-facilities/:id
router.get('/:id', healthFacilityController.getFacilityById);

// Get facility services
// GET /api/health-facilities/:id/services
router.get('/:id/services', healthFacilityController.getFacilityServices);

module.exports = router;