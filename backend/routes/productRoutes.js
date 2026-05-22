import express from 'express';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getCategories, 
  createCategory 
} from '../controllers/productController.js';
import { protect, authorizeRoles, enforceBranchScope } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, enforceBranchScope, getProducts)
  .post(protect, authorizeRoles('Super Admin', 'Sweet Owner'), enforceBranchScope, createProduct);

router.route('/categories')
  .get(protect, getCategories)
  .post(protect, authorizeRoles('Super Admin', 'Sweet Owner'), createCategory);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Sweet Owner'), updateProduct)
  .delete(protect, authorizeRoles('Super Admin', 'Sweet Owner'), deleteProduct);

export default router;
