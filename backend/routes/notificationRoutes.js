import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect, enforceBranchScope } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, enforceBranchScope, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/read-all', protect, enforceBranchScope, markAllAsRead);

export default router;
