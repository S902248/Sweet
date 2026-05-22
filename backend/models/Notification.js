import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['low_stock', 'expiry_alert', 'new_order', 'payment_pending', 'general'], 
    default: 'general' 
  },
  branchId: { type: String, default: null }, // Null means all or Super Admin
  read: { type: Boolean, default: false }
}, { timestamps: true });

const MongooseNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export const Notification = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('notification', query);
    }
    return MongooseNotification.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('notification', query);
    }
    return MongooseNotification.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('notification', id);
    }
    return MongooseNotification.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('notification', data);
    }
    return MongooseNotification.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('notification', id, update);
    }
    return MongooseNotification.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('notification', id);
    }
    return MongooseNotification.findByIdAndDelete(id);
  }
};
export default Notification;
