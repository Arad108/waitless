// routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const { 
    verifyToken, 
    checkRole, 
    isBusinessOwner 
} = require('../middleware/authMiddleware');
const { 
    getAllBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessesByOwner,
    toggleBusinessStatus
} = require('../controllers/businessController');
const { basicLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes
router.get('/', basicLimiter, getAllBusinesses);
router.get('/:id', getBusinessById);

// Protected routes
router.use(verifyToken);

// Business owner routes
router.post('/', checkRole('business'), createBusiness);
router.get('/owner/:ownerId', getBusinessesByOwner);
router.put('/:id', isBusinessOwner, updateBusiness);
router.delete('/:id', isBusinessOwner, deleteBusiness);
router.patch('/:id/toggle-status', isBusinessOwner, toggleBusinessStatus);

module.exports = router;