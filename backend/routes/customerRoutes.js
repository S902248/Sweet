import express from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerByPhone } from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

router.get('/phone/:phone', protect, getCustomerByPhone);

router.route('/:id')
  .put(protect, updateCustomer)
  .delete(protect, deleteCustomer);

export default router;
