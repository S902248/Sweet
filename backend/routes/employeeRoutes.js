import express from 'express';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  recordAttendance 
} from '../controllers/employeeController.js';
import { protect, authorizeRoles, enforceBranchScope } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, enforceBranchScope, getEmployees)
  .post(protect, authorizeRoles('Super Admin', 'Sweet Owner'), enforceBranchScope, createEmployee);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Sweet Owner'), updateEmployee)
  .delete(protect, authorizeRoles('Super Admin', 'Sweet Owner'), deleteEmployee);

router.post('/attendance/:id', protect, authorizeRoles('Super Admin', 'Sweet Owner'), recordAttendance);

export default router;
