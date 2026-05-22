import express from 'express';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  recordAttendance 
} from '../controllers/employeeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEmployees)
  .post(protect, authorizeRoles('Super Admin', 'Branch Manager'), createEmployee);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Branch Manager'), updateEmployee)
  .delete(protect, authorizeRoles('Super Admin'), deleteEmployee);

router.post('/attendance/:id', protect, authorizeRoles('Super Admin', 'Branch Manager'), recordAttendance);

export default router;
