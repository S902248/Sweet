import express from 'express';
import { getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, enforceBranchScope } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, enforceBranchScope, getOrders);
router.put('/:id/status', protect, updateOrderStatus);

export default router;
