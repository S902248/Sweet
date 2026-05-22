import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

// Configure DNS fallback to handle MongoDB Atlas SRV resolution on networks with problematic DNS settings
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e);
}


// Routes
import authRoutes from './routes/authRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import productRoutes from './routes/productRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Middlewares & Seeders
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seedDatabase } from './utils/seed.js';
import User from './models/User.js';

// Load Environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach Socket.io server to app
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/products', productRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('SweetFlow ERP API is running...');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// DB Connection & Server Boot
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweetflow';

const bootServer = async () => {
  const useMock = process.env.USE_MOCK_DB === 'true';
  
  if (!useMock) {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('MongoDB connected successfully.');
    } catch (error) {
      console.error('MongoDB connection failed. Falling back to local Mock database.', error);
      process.env.USE_MOCK_DB = 'true';
    }
  } else {
    console.log('Running server with Local Mock Database fallback.');
  }

  // Self-seed database if empty or missing the new seeded users
  try {
    const users = await User.find({});
    const ownerExists = await User.findOne({ email: 'owner1@sweetflow.com' });
    if (users.length === 0 || !ownerExists) {
      console.log('No user records or new owner records found. Bootstrapping seed data...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Error during automatic database bootstrap:', err);
  }

  server.listen(PORT, () => {
    console.log(`SweetFlow Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

bootServer();
