import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 },
  membershipType: { 
    type: String, 
    enum: ['Regular', 'Silver', 'Gold', 'Platinum'], 
    default: 'Regular' 
  },
  totalPurchases: { type: Number, default: 0 }
}, { timestamps: true });

const MongooseCustomer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export const Customer = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('customer', query);
    }
    return MongooseCustomer.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('customer', query);
    }
    return MongooseCustomer.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('customer', id);
    }
    return MongooseCustomer.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('customer', data);
    }
    return MongooseCustomer.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('customer', id, update);
    }
    return MongooseCustomer.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('customer', id);
    }
    return MongooseCustomer.findByIdAndDelete(id);
  }
};
export default Customer;
