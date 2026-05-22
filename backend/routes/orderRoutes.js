import express from 'express';
import { getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getOrders);
router.put('/:id/status', protect, updateOrderStatus);

export default router;
