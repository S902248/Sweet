import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const billSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  customerId: { type: String, default: null },
  customerPhone: { type: String, default: '' },
  customerName: { type: String, default: 'Walk-in Customer' },
  branchId: { type: String, required: true },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true }, // GST amount
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Paid' },
  pdfUrl: { type: String, default: '' },
  upiId: { type: String, default: 'sweetflow@ybl' }
}, { timestamps: true });

const MongooseBill = mongoose.models.Bill || mongoose.model('Bill', billSchema);

export const Bill = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('bill', query);
    }
    return MongooseBill.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('bill', query);
    }
    return MongooseBill.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('bill', id);
    }
    return MongooseBill.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('bill', data);
    }
    return MongooseBill.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('bill', id, update);
    }
    return MongooseBill.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('bill', id);
    }
    return MongooseBill.findByIdAndDelete(id);
  }
};
export default Bill;
