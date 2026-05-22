import bcrypt from 'bcryptjs';
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
    // Clear Mock DB file if using mock db
    if (process.env.USE_MOCK_DB === 'true') {
      mockDb.clearAll();
      console.log('Cleared mock database file.');
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

    const manager = await User.create({
      username: 'Ramesh Sen',
      email: 'manager@sweetflow.com',
      password: hashedPassword,
      role: 'Branch Manager',
      branchId: b1._id
    });

    const cashier = await User.create({
      username: 'Suresh Kumar',
      email: 'cashier@sweetflow.com',
      password: hashedPassword,
      role: 'Cashier',
      branchId: b1._id
    });

    const inventoryStaff = await User.create({
      username: 'Gopal Shaw',
      email: 'inventory@sweetflow.com',
      password: hashedPassword,
      role: 'Inventory Staff',
      branchId: b1._id
    });

    // Assign manager to branch
    await Branch.findByIdAndUpdate(b1._id, { managerId: manager._id });

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
      { name: 'Kolkata Rosogolla', category: 'Bengali sweets', price: 20, costPrice: 10, stock: 150, lowStockThreshold: 20, barcode: '8901234567890', branchId: b1._id },
      { name: 'Kesar Sondesh', category: 'Bengali sweets', price: 25, costPrice: 12, stock: 120, lowStockThreshold: 15, barcode: '8901234567891', branchId: b1._id },
      { name: 'Mishti Doi (Cup)', category: 'Bengali sweets', price: 40, costPrice: 20, stock: 8, lowStockThreshold: 15, barcode: '8901234567892', branchId: b1._id }, // low stock
      { name: 'Kaju Katli', category: 'Dry sweets', price: 800, costPrice: 500, stock: 50, lowStockThreshold: 10, barcode: '8901234567893', branchId: b1._id },
      { name: 'Motichoor Laddu', category: 'Dry sweets', price: 300, costPrice: 180, stock: 80, lowStockThreshold: 15, barcode: '8901234567894', branchId: b1._id },
      { name: 'Singara (Samosa)', category: 'Snacks', price: 15, costPrice: 7, stock: 200, lowStockThreshold: 30, barcode: '8901234567895', branchId: b1._id },
      { name: 'Aloo Bhujia', category: 'Namkeen', price: 240, costPrice: 150, stock: 4, lowStockThreshold: 8, barcode: '8901234567896', branchId: b1._id }, // low stock
      { name: 'Eggless Chocolate Cake', category: 'Bakery', price: 350, costPrice: 200, stock: 12, lowStockThreshold: 5, barcode: '8901234567897', branchId: b1._id },
    ];

    const seededProducts = [];
    for (const p of productsData) {
      const prod = await Product.create(p);
      seededProducts.push(prod);
    }

    console.log('Seeding employees...');
    const emp1 = await Employee.create({
      name: 'Ramesh Sen',
      phone: '9836012345',
      role: 'Branch Manager',
      branchId: b1._id,
      salary: 35000,
      attendance: [
        { date: '2026-05-20', status: 'Present' },
        { date: '2026-05-21', status: 'Present' }
      ],
      performanceScore: 5
    });

    const emp2 = await Employee.create({
      name: 'Suresh Kumar',
      phone: '9836067890',
      role: 'Cashier',
      branchId: b1._id,
      salary: 18000,
      attendance: [
        { date: '2026-05-20', status: 'Present' },
        { date: '2026-05-21', status: 'Present' }
      ],
      performanceScore: 4
    });

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
      
      // Generate 2-4 orders per day
      const orderCount = Math.floor(2 + Math.random() * 3);
      for (let k = 0; k < orderCount; k++) {
        const orderNum = `SF-${date.getTime().toString().substr(-6)}-${k}`;
        const invNum = `INV-${date.getTime().toString().substr(-6)}-${k}`;
        
        // Choose random product
        const prod = seededProducts[Math.floor(Math.random() * seededProducts.length)];
        const qty = Math.floor(1 + Math.random() * 5);
        const subtotal = prod.price * qty;
        const discount = Math.random() > 0.7 ? 10 : 0;
        const tax = parseFloat(((subtotal - discount) * 0.05).toFixed(2));
        const total = subtotal - discount + tax;

        const order = await Order.create({
          orderNumber: orderNum,
          branchId: b1._id,
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
          branchId: b1._id,
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

    console.log('Seeding activity logs & notifications...');
    await ActivityLog.create({ userId: superAdmin._id, userName: superAdmin.username, action: 'Seed Database', details: 'Initialized ERP database with seed records.', ipAddress: '127.0.0.1' });
    
    // Seed notifications for low stock products (e.g. Mishti Doi, Aloo Bhujia)
    await Notification.create({
      title: 'Low Stock Alert',
      message: 'Low stock alert: Product Mishti Doi (Cup) has only 8 left.',
      type: 'low_stock',
      branchId: b1._id
    });
    
    await Notification.create({
      title: 'Low Stock Alert',
      message: 'Low stock alert: Product Aloo Bhujia has only 4 units left.',
      type: 'low_stock',
      branchId: b1._id
    });

    console.log('Database seeding successfully completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
