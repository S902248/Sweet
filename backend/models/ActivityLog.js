import mongoose from 'mongoose';
import { mockDb } from '../utils/dbFallback.js';

const activityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
}, { timestamps: true });

const MongooseActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

export const ActivityLog = {
  find: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.find('activitylog', query);
    }
    return MongooseActivityLog.find(query);
  },
  findOne: async (query = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findOne('activitylog', query);
    }
    return MongooseActivityLog.findOne(query);
  },
  findById: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findById('activitylog', id);
    }
    return MongooseActivityLog.findById(id);
  },
  create: async (data) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.create('activitylog', data);
    }
    return MongooseActivityLog.create(data);
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndUpdate('activitylog', id, update);
    }
    return MongooseActivityLog.findByIdAndUpdate(id, update, { new: true, ...options });
  },
  findByIdAndDelete: async (id) => {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDb.findByIdAndDelete('activitylog', id);
    }
    return MongooseActivityLog.findByIdAndDelete(id);
  }
};
export default ActivityLog;
