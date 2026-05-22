import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import ActivityLog from '../models/ActivityLog.js';
import { mockDb } from './dbFallback.js';

export const seedDatabase = async () => {
  try {
    // Clear Mock DB file if using mock db, or clear Mongoose collections if using real DB
    if (process.env.USE_MOCK_DB === 'true') {
      mockDb.clearAll();
      console.log('Cleared mock database file.');
    } else {
      console.log('Clearing existing MongoDB collections for clean seed...');
      await Promise.all([
        mongoose.model('Branch').deleteMany({}),
        mongoose.model('User').deleteMany({}),
        mongoose.model('Category').deleteMany({}),
        mongoose.model('Supplier').deleteMany({}),
        mongoose.model('Product').deleteMany({}),
        mongoose.model('Employee').deleteMany({}),
        mongoose.model('Customer').deleteMany({}),
        mongoose.model('Order').deleteMany({}),
        mongoose.model('Bill').deleteMany({}),
        mongoose.model('ActivityLog').deleteMany({}),
        mongoose.model('Notification').deleteMany({})
      ]);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('Seeding HQ branch...');
    const hqBranch = await Branch.create({
      name: 'Salt Lake HQ Branch',
      address: 'Block C, Sector V, Salt Lake, Kolkata',
      gstNumber: '19AABCS1234F1Z1',
      isActive: true
    });

    console.log('Seeding users...');
    const superAdmin = await User.create({
      username: 'Super Admin',
      email: 'admin@sweetflow.com',
      password: hashedPassword,
      role: 'Super Admin',
      branchId: null
    });

    const hqOwner = await User.create({
      username: 'HQ Owner',
      email: 'owner1@sweetflow.com',
      password: hashedPassword,
      role: 'Sweet Owner',
      branchId: hqBranch._id
    });

    // Assign owner as the manager of the branch
    await Branch.findByIdAndUpdate(hqBranch._id, { managerId: hqOwner._id });

    console.log('Seeding categories...');
    const categoriesData = [
      { name: 'Bengali Sweets', description: 'Traditional chhena-based milk sweets' },
      { name: 'Dry Sweets', description: 'Kaju, Mawa, and dry fruit items' },
      { name: 'Ghee Sweets', description: 'Premium sweets prepared in pure desi ghee' },
      { name: 'Snacks & Namkeen', description: 'Samosas, namkeens, and savoury snacks' }
    ];
    for (const cat of categoriesData) {
      await Category.create(cat);
    }

    console.log('Seeding suppliers...');
    await Supplier.create({
      name: 'Kolkata Dairy Cooperatives',
      contactName: 'Rajesh Das',
      phone: '9830098300',
      email: 'rajesh@kolkatamilk.com',
      address: 'Barasat, North 24 Parganas',
      categoriesSupplied: ['Bengali Sweets']
    });

    await Supplier.create({
      name: 'Gauranga Sugar Distributors',
      contactName: 'Madan Lal',
      phone: '9845098450',
      email: 'madan@gaurangasugar.com',
      address: 'Liluah, Howrah',
      categoriesSupplied: ['Bengali Sweets', 'Ghee Sweets']
    });

    await Supplier.create({
      name: 'Bharat Flour & Spices',
      contactName: 'Sanjay Shah',
      phone: '9831298312',
      email: 'sanjay@bharatflour.com',
      address: 'Burrabazar, Kolkata',
      categoriesSupplied: ['Snacks & Namkeen']
    });

    console.log('Seeding master products...');
    const productsData = [
      { name: 'Nolen Gur Rosogolla', category: 'Bengali Sweets', price: 15, costPrice: 7, stock: 100, lowStockThreshold: 20, barcode: '8901234567891' },
      { name: 'Special Kesar Sondesh', category: 'Bengali Sweets', price: 20, costPrice: 10, stock: 120, lowStockThreshold: 15, barcode: '8901234567892' },
      { name: 'Premium Kaju Katli (1kg)', category: 'Dry Sweets', price: 900, costPrice: 550, stock: 50, lowStockThreshold: 10, barcode: '8901234567893' },
      { name: 'Desi Ghee Laddu (500g)', category: 'Ghee Sweets', price: 250, costPrice: 150, stock: 80, lowStockThreshold: 15, barcode: '8901234567894' },
      { name: 'Singara (Samosa)', category: 'Snacks & Namkeen', price: 12, costPrice: 5, stock: 150, lowStockThreshold: 30, barcode: '8901234567895' },
      { name: 'Aloo Bhujia (200g)', category: 'Snacks & Namkeen', price: 50, costPrice: 30, stock: 60, lowStockThreshold: 12, barcode: '8901234567896' }
    ];

    for (const p of productsData) {
      await Product.create({
        ...p,
        branchId: hqBranch._id
      });
    }

    console.log('Seeding activity logs...');
    await ActivityLog.create({
      userId: superAdmin._id || superAdmin.id,
      userName: superAdmin.username,
      action: 'Seed Database',
      details: 'Initialized database with clean production starter master data.',
      ipAddress: '127.0.0.1'
    });

    console.log('Database seeding successfully completed (Clean Starter State).');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
