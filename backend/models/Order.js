import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  branchId: { type: String, required: true },
  customerId: { type: String, default: null },
  customerPhone: { type: String, default: '' },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      category: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, required: true }, // GST
  finalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Card', 'UPI'], 
    default: 'Cash' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Refunded'], 
    default: 'Completed' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Completed', 'Delivered'], 
    default: 'Completed' 
  },
  type: { 
    type: String, 
    enum: ['Counter', 'Online', 'Delivery'], 
    default: 'Counter' 
  }
}, { timestamps: true });

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

export const Order = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('order', query);
    }
    return MongooseOrder.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('order', query);
    }
    return MongooseOrder.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('order', id);
    }
    return MongooseOrder.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('order', data);
    }
    return MongooseOrder.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('order', id, update);
    }
    return MongooseOrder.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('order', id);
    }
    return MongooseOrder.findByIdAndDelete(id);
  }
};
export default Order;
