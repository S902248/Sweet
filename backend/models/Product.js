import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. Bengali sweets, Dry sweets, Snacks, Bakery, Namkeen
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  expiryDate: { type: Date, default: null },
  barcode: { type: String, default: '' },
  branchId: { type: String, default: null }, // Branch ID
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

const MongooseProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

export const Product = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('product', query);
    }
    return MongooseProduct.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('product', query);
    }
    return MongooseProduct.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('product', id);
    }
    return MongooseProduct.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('product', data);
    }
    return MongooseProduct.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('product', id, update);
    }
    return MongooseProduct.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('product', id);
    }
    return MongooseProduct.findByIdAndDelete(id);
  }
};
export default Product;
