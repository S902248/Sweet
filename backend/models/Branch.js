import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  managerId: { type: String, default: null }, // User/Employee ID
  gstNumber: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const MongooseBranch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);

export const Branch = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('branch', query);
    }
    return MongooseBranch.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('branch', query);
    }
    return MongooseBranch.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('branch', id);
    }
    return MongooseBranch.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('branch', data);
    }
    return MongooseBranch.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('branch', id, update);
    }
    return MongooseBranch.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('branch', id);
    }
    return MongooseBranch.findByIdAndDelete(id);
  }
};
export default Branch;
