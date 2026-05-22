import express from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBranches)
  .post(protect, authorizeRoles('Super Admin'), createBranch);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin'), updateBranch)
  .delete(protect, authorizeRoles('Super Admin'), deleteBranch);

export default router;
