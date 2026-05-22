import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import Employee from '../models/Employee.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Bill from '../models/Bill.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
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

    console.log('Seeding branches...');
    const b1 = await Branch.create({ name: 'Salt Lake Branch', address: 'Block C, Sector V, Salt Lake, Kolkata', gstNumber: '19AABCS1234F1Z1', isActive: true });
    const b2 = await Branch.create({ name: 'Park Street Branch', address: 'Park Street Crossroad, Kolkata', gstNumber: '19AABCS5678F1Z2', isActive: true });
    const b3 = await Branch.create({ name: 'Howrah Terminal Branch', address: 'Howrah Station Food Plaza, Howrah', gstNumber: '19AABCS9012F1Z3', isActive: true });

    console.log('Seeding users...');
    const superAdmin = await User.create({
      username: 'Super Admin',
      email: 'admin@sweetflow.com',
      password: hashedPassword,
      role: 'Super Admin',
      branchId: null
    });

    const owner1 = await User.create({
      username: 'Salt Lake Owner',
      email: 'owner1@sweetflow.com',
      password: hashedPassword,
      role: 'Sweet Owner',
      branchId: b1._id
    });

    const owner2 = await User.create({
      username: 'Park Street Owner',
      email: 'owner2@sweetflow.com',
      password: hashedPassword,
      role: 'Sweet Owner',
      branchId: b2._id
    });

    const owner3 = await User.create({
      username: 'Howrah Owner',
      email: 'owner3@sweetflow.com',
      password: hashedPassword,
      role: 'Sweet Owner',
      branchId: b3._id
    });

    // Assign owner to branch
    await Branch.findByIdAndUpdate(b1._id, { managerId: owner1._id });
    await Branch.findByIdAndUpdate(b2._id, { managerId: owner2._id });
    await Branch.findByIdAndUpdate(b3._id, { managerId: owner3._id });

    console.log('Seeding categories...');
    const catNames = ['Bengali sweets', 'Dry sweets', 'Snacks', 'Bakery', 'Namkeen'];
    for (const name of catNames) {
      await Category.create({ name, description: `Authentic ${name} products` });
    }

    console.log('Seeding suppliers...');
    const s1 = await Supplier.create({ name: 'Kolkata Milk Co.', contactName: 'Rajesh Das', phone: '9830098300', email: 'rajesh@kolkatamilk.com', address: 'Barasat, North 24 Parganas', categoriesSupplied: ['Bengali sweets'] });
    const s2 = await Supplier.create({ name: 'Rajasthan Flour Mill', contactName: 'Madan Lal', phone: '9845098450', email: 'madan@rajflour.com', address: 'Liluah, Howrah', categoriesSupplied: ['Namkeen', 'Snacks'] });

    console.log('Seeding products...');
    const productsData = [
      { name: 'Kolkata Rosogolla', category: 'Bengali sweets', price: 20, costPrice: 10, stock: 150, lowStockThreshold: 20, barcode_prefix: '890123456789' },
      { name: 'Kesar Sondesh', category: 'Bengali sweets', price: 25, costPrice: 12, stock: 120, lowStockThreshold: 15, barcode_prefix: '890123456790' },
      { name: 'Mishti Doi (Cup)', category: 'Bengali sweets', price: 40, costPrice: 20, stock: 8, lowStockThreshold: 15, barcode_prefix: '890123456791' }, // low stock
      { name: 'Kaju Katli', category: 'Dry sweets', price: 800, costPrice: 500, stock: 50, lowStockThreshold: 10, barcode_prefix: '890123456792' },
      { name: 'Motichoor Laddu', category: 'Dry sweets', price: 300, costPrice: 180, stock: 80, lowStockThreshold: 15, barcode_prefix: '890123456793' },
      { name: 'Singara (Samosa)', category: 'Snacks', price: 15, costPrice: 7, stock: 200, lowStockThreshold: 30, barcode_prefix: '890123456794' },
      { name: 'Aloo Bhujia', category: 'Namkeen', price: 240, costPrice: 150, stock: 4, lowStockThreshold: 8, barcode_prefix: '890123456795' }, // low stock
      { name: 'Eggless Chocolate Cake', category: 'Bakery', price: 350, costPrice: 200, stock: 12, lowStockThreshold: 5, barcode_prefix: '890123456796' },
    ];

    const seededProducts = [];
    const branches = [b1, b2, b3];
    let barcodeIdx = 100;
    for (const branch of branches) {
      for (const p of productsData) {
        const prod = await Product.create({
          name: p.name,
          category: p.category,
          price: p.price,
          costPrice: p.costPrice,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          barcode: `${p.barcode_prefix}${barcodeIdx++}`,
          branchId: branch._id
        });
        seededProducts.push(prod);
      }
    }

    console.log('Seeding employees...');
    const employeeNames = [
      { name: 'Ramesh Sen', role: 'Branch Manager', salary: 35000 },
      { name: 'Suresh Kumar', role: 'Cashier', salary: 18000 },
      { name: 'Gopal Shaw', role: 'Inventory Staff', salary: 20000 }
    ];

    for (const branch of branches) {
      for (const empData of employeeNames) {
        await Employee.create({
          name: `${empData.name} (${branch.name.split(' ')[0]})`,
          phone: `98360${Math.floor(100000 + Math.random() * 900000)}`,
          role: empData.role,
          branchId: branch._id,
          salary: empData.salary,
          attendance: [
            { date: '2026-05-20', status: 'Present' },
            { date: '2026-05-21', status: 'Present' }
          ],
          performanceScore: Math.floor(4 + Math.random() * 2)
        });
      }
    }

    console.log('Seeding customers...');
    const cust1 = await Customer.create({ name: 'Amit Sharma', phone: '9876543210', email: 'amit@gmail.com', loyaltyPoints: 120, membershipType: 'Gold', totalPurchases: 12000 });
    const cust2 = await Customer.create({ name: 'Priya Verma', phone: '9876501234', email: 'priya@gmail.com', loyaltyPoints: 45, membershipType: 'Silver', totalPurchases: 4500 });
    const cust3 = await Customer.create({ name: 'Rahul Gupta', phone: '9123456789', email: 'rahul@gmail.com', loyaltyPoints: 8, membershipType: 'Regular', totalPurchases: 800 });

    console.log('Seeding historical sales orders...');
    // Seed sales for the last 30 days to build a beautiful Recharts graph
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }

    for (let j = 0; j < dates.length; j++) {
      const date = dates[j];
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate 2-4 orders per day per branch
      for (const branch of branches) {
        const orderCount = Math.floor(1 + Math.random() * 3);
        for (let k = 0; k < orderCount; k++) {
          const orderNum = `SF-${dateStr}-${branch.name.substr(0,2).toUpperCase()}-${k}`;
          const invNum = `INV-${dateStr}-${branch.name.substr(0,2).toUpperCase()}-${k}`;
          
          // Choose random product of this branch
          const branchProducts = seededProducts.filter(p => p.branchId.toString() === branch._id.toString());
          const prod = branchProducts[Math.floor(Math.random() * branchProducts.length)];
          const qty = Math.floor(1 + Math.random() * 5);
          const subtotal = prod.price * qty;
          const discount = Math.random() > 0.7 ? 10 : 0;
          const tax = parseFloat(((subtotal - discount) * 0.05).toFixed(2));
          const total = subtotal - discount + tax;

          const order = await Order.create({
            orderNumber: orderNum,
            branchId: branch._id,
            customerId: cust1._id,
            customerPhone: cust1.phone,
            items: [
              {
                productId: prod._id,
                name: prod.name,
                price: prod.price,
                quantity: qty,
                category: prod.category
              }
            ],
            totalAmount: subtotal,
            discountAmount: discount,
            taxAmount: tax,
            finalAmount: total,
            paymentMethod: ['Cash', 'Card', 'UPI'][Math.floor(Math.random() * 3)],
            paymentStatus: 'Completed',
            status: 'Completed',
            type: 'Counter',
            createdAt: date.toISOString(),
            updatedAt: date.toISOString()
          });

          await Bill.create({
            invoiceNumber: invNum,
            orderId: order._id,
            customerId: cust1._id,
            customerPhone: cust1.phone,
            customerName: cust1.name,
            branchId: branch._id,
            subtotal,
            taxAmount: tax,
            discount,
            totalAmount: total,
            paymentMethod: order.paymentMethod,
            paymentStatus: 'Paid',
            pdfUrl: `/api/billing/invoice/${invNum}/pdf`,
            createdAt: date.toISOString(),
            updatedAt: date.toISOString()
          });
        }
      }
    }

    console.log('Seeding activity logs & notifications...');
    await ActivityLog.create({ userId: superAdmin._id, userName: superAdmin.username, action: 'Seed Database', details: 'Initialized ERP database with seed records.', ipAddress: '127.0.0.1' });
    
    // Seed notifications for low stock products per branch
    for (const branch of branches) {
      await Notification.create({
        title: 'Low Stock Alert',
        message: 'Low stock alert: Product Mishti Doi (Cup) has only 8 left.',
        type: 'low_stock',
        branchId: branch._id
      });
      
      await Notification.create({
        title: 'Low Stock Alert',
        message: 'Low stock alert: Product Aloo Bhujia has only 4 units left.',
        type: 'low_stock',
        branchId: branch._id
      });
    }

    console.log('Database seeding successfully completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
