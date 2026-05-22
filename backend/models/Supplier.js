import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactName: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  categoriesSupplied: [{ type: String }]
}, { timestamps: true });

const MongooseSupplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

export const Supplier = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('supplier', query);
    }
    return MongooseSupplier.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('supplier', query);
    }
    return MongooseSupplier.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('supplier', id);
    }
    return MongooseSupplier.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('supplier', data);
    }
    return MongooseSupplier.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('supplier', id, update);
    }
    return MongooseSupplier.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('supplier', id);
    }
    return MongooseSupplier.findByIdAndDelete(id);
  }
};
export default Supplier;
