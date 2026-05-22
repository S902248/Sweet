import express from 'express';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getCategories, 
  createCategory 
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorizeRoles('Super Admin', 'Branch Manager', 'Inventory Staff'), createProduct);

router.route('/categories')
  .get(protect, getCategories)
  .post(protect, authorizeRoles('Super Admin', 'Branch Manager', 'Inventory Staff'), createCategory);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Branch Manager', 'Inventory Staff'), updateProduct)
  .delete(protect, authorizeRoles('Super Admin', 'Branch Manager'), deleteProduct);

export default router;
