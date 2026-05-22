import express from 'express';
import { getDashboardStats, getAIReport } from '../controllers/analyticsController.js';
import { protect, authorizeRoles, enforceBranchScope } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorizeRoles('Super Admin', 'Sweet Owner'), enforceBranchScope, getDashboardStats);
router.get('/ai-report', protect, authorizeRoles('Super Admin', 'Sweet Owner'), enforceBranchScope, getAIReport);

export default router;
