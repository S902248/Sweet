import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Sweet Owner'], 
    default: 'Sweet Owner' 
  },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

export const User = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('user', query);
    }
    return MongooseUser.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('user', query);
    }
    return MongooseUser.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('user', id);
    }
    return MongooseUser.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('user', data);
    }
    return MongooseUser.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('user', id, update);
    }
    return MongooseUser.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('user', id);
    }
    return MongooseUser.findByIdAndDelete(id);
  }
};
export default User;
