import express from 'express';
import { registerUser, loginUser, getUserProfile, getActivityLogs } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', rateLimiter(20), registerUser);
router.post('/login', rateLimiter(20), loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/logs', protect, authorizeRoles('Super Admin'), getActivityLogs);

export default router;
