import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

export const getProducts = async (req, res) => {
  try {
    const { branchId, category } = req.query;
    let query = {};
    if (branchId) query.branchId = branchId;
    if (category) query.category = category;

    const products = await Product.find(query);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, costPrice, stock, lowStockThreshold, expiryDate, barcode, branchId, imageUrl } = req.body;
    
    const product = await Product.create({
      name,
      category,
      price,
      costPrice: costPrice || price * 0.6, // Default cost price is 60% of sale price
      stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 10,
      expiryDate: expiryDate || null,
      barcode: barcode || '',
      branchId: branchId || null,
      imageUrl: imageUrl || ''
    });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Create Product',
      details: `Created product ${name} in category ${category}`,
      ipAddress: req.ip || 'local'
    });

    // Check if stock is low immediately
    if (product.stock <= product.lowStockThreshold) {
      const alertMsg = `Low stock alert: Product ${product.name} has only ${product.stock} left.`;
      
      const notif = await Notification.create({
        title: 'Low Stock Alert',
        message: alertMsg,
        type: 'low_stock',
        branchId: product.branchId
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('notification', notif);
      }
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const oldProduct = await Product.findById(id);
    if (!oldProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role !== 'Super Admin' && oldProduct.branchId && oldProduct.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this product' });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Update Product',
      details: `Updated product ${product.name}`,
      ipAddress: req.ip || 'local'
    });

    // Check low stock
    if (product.stock <= product.lowStockThreshold && oldProduct.stock > product.lowStockThreshold) {
      const alertMsg = `Low stock alert: Product ${product.name} has only ${product.stock} units left.`;
      
      const notif = await Notification.create({
        title: 'Low Stock Alert',
        message: alertMsg,
        type: 'low_stock',
        branchId: product.branchId
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('notification', notif);
      }
    } else if (product.stock > product.lowStockThreshold) {
      // If stock goes above threshold, clear existing low stock notifications for this product
      const unreadNotifs = await Notification.find({ type: 'low_stock', read: false });
      for (const notif of unreadNotifs) {
        if (notif.message.includes(`Product ${product.name}`)) {
          await Notification.findByIdAndUpdate(notif._id || notif.id, { read: true });
        }
      }
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role !== 'Super Admin' && product.branchId && product.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(id);

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Delete Product',
      details: `Deleted product ${product.name}`,
      ipAddress: req.ip || 'local'
    });

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
