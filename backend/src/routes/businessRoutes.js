// src/routes/businessRoutes.js
const express = require('express');
const businessController = require('../controllers/businessController');
const { verifyToken, checkRole, isBusinessOwner } = require('../middleware/authMiddleware');

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No login required)
// ==========================================
// Users need to be able to search and view businesses without an account
router.get('/search', businessController.searchBusinesses); // The ultimate flex endpoint!
router.get('/', businessController.getAllBusinesses);
router.get('/:id', businessController.getBusinessById);
router.get('/owner/:ownerId', businessController.getBusinessesByOwner);

// ==========================================
// PROTECTED ROUTES (Requires Login)
// ==========================================
router.use(verifyToken);

// Create a business (Only Business Owners and Admins can do this)
router.post('/', checkRole('business_owner', 'admin'), businessController.createBusiness);

// ==========================================
// OWNER & ADMIN ONLY ROUTES
// ==========================================
// These routes use your custom `isBusinessOwner` middleware!
// If a random user tries to update a hospital, this blocks them instantly.

router.put('/:id', isBusinessOwner, businessController.updateBusiness);
router.delete('/:id', isBusinessOwner, businessController.deleteBusiness);
router.patch('/:id/toggle', isBusinessOwner, businessController.toggleBusinessStatus);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
router.get('/system/stats', checkRole('admin'), businessController.getSystemStats);

module.exports = router;