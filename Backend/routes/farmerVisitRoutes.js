import express from 'express';
import {
    getFarmerVisits,
    getFarmerVisit,
    createFarmerVisit,
    updateFarmerVisit,
    deleteFarmerVisit,
    updateVisitStatus,
    getVisitStats,
    getFarmersSummary
} from '../controllers/farmerVisitController.js';

import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Test endpoint without authentication
router.get('/test', (req, res) => {
    res.json({ message: 'Farmer visit routes are working!' });
});

// Protect all routes - only authenticated users
router.use(protect);

// Only experts can access these routes
router.use(authorize('expert'));

// Main routes
router.route('/')
    .get(getFarmerVisits)
    .post(createFarmerVisit);

router.route('/stats')
    .get(getVisitStats);

router.route('/farmers-summary')
    .get(getFarmersSummary);

router.route('/:id')
    .get(getFarmerVisit)
    .put(updateFarmerVisit)
    .delete(deleteFarmerVisit);

router.route('/:id/status')
    .put(updateVisitStatus);

export default router;
