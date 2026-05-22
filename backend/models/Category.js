import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
}, { timestamps: true });

const MongooseCategory = mongoose.models.Category || mongoose.model('Category', categorySchema);

export const Category = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('category', query);
    }
    return MongooseCategory.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('category', query);
    }
    return MongooseCategory.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('category', id);
    }
    return MongooseCategory.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('category', data);
    }
    return MongooseCategory.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('category', id, update);
    }
    return MongooseCategory.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('category', id);
    }
    return MongooseCategory.findByIdAndDelete(id);
  }
};
export default Category;
