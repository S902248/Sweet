import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Branch Manager', 'Cashier', 'Inventory Staff'], 
    required: true 
  },
  branchId: { type: String, default: null }, // Branch ID
  salary: { type: Number, required: true },
  attendance: [
    {
      date: { type: String }, // e.g. YYYY-MM-DD
      status: { type: String, enum: ['Present', 'Absent', 'Late', 'Leave'], default: 'Present' }
    }
  ],
  performanceScore: { type: Number, default: 5 } // rating out of 5
}, { timestamps: true });

const MongooseEmployee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export const Employee = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('employee', query);
    }
    return MongooseEmployee.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('employee', query);
    }
    return MongooseEmployee.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('employee', id);
    }
    return MongooseEmployee.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('employee', data);
    }
    return MongooseEmployee.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('employee', id, update);
    }
    return MongooseEmployee.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('employee', id);
    }
    return MongooseEmployee.findByIdAndDelete(id);
  }
};
export default Employee;
