import express from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSuppliers)
  .post(protect, authorizeRoles('Super Admin', 'Sweet Owner'), createSupplier);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Sweet Owner'), updateSupplier)
  .delete(protect, authorizeRoles('Super Admin', 'Sweet Owner'), deleteSupplier);

export default router;
