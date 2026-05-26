import express from 'express';
import { 
  registerUser, loginUser, getUserProfile, getActivityLogs,
  getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', rateLimiter(20), registerUser);
router.post('/login', rateLimiter(20), loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/logs', protect, authorizeRoles('Super Admin'), getActivityLogs);

// User Management (Admin only)
router.get('/users', protect, authorizeRoles('Super Admin'), getAllUsers);
router.post('/users', protect, authorizeRoles('Super Admin'), createUser);
router.put('/users/:id', protect, authorizeRoles('Super Admin'), updateUser);
router.delete('/users/:id', protect, authorizeRoles('Super Admin'), deleteUser);
router.patch('/users/:id/toggle-status', protect, authorizeRoles('Super Admin'), toggleUserStatus);

export default router;
