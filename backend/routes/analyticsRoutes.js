import express from 'express';
import { getDashboardStats, getAIReport } from '../controllers/analyticsController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorizeRoles('Super Admin', 'Branch Manager'), getDashboardStats);
router.get('/ai-report', protect, authorizeRoles('Super Admin', 'Branch Manager'), getAIReport);

export default router;
