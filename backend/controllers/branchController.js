import Branch from '../models/Branch.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({});
    const products = await Product.find({});
    const orders = await Order.find({});

    const branchesWithStats = branches.map(b => {
      const bObj = b.toObject ? b.toObject() : b;
      const branchIdStr = bObj._id ? bObj._id.toString() : bObj.id;

      const branchProducts = products.filter(p => p.branchId === branchIdStr);
      const totalStock = branchProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
      const totalProducts = branchProducts.length;

      const branchOrders = orders.filter(o => o.branchId === branchIdStr);
      const totalSales = branchOrders
        .filter(o => o.status === 'Completed' || o.paymentStatus === 'Completed' || o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);
      const totalOrdersCount = branchOrders.length;

      return {
        ...bObj,
        stats: {
          totalStock,
          totalProducts,
          totalSales: Math.round(totalSales),
          totalOrders: totalOrdersCount
        }
      };
    });

    res.status(200).json({ success: true, data: branchesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBranch = async (req, res) => {
  try {
    const { name, address, managerId, gstNumber } = req.body;
    const branch = await Branch.create({ name, address, managerId, gstNumber });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Create Branch',
      details: `Created branch ${name}`,
      ipAddress: req.ip || 'local'
    });

    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Update Branch',
      details: `Updated branch ${branch.name}`,
      ipAddress: req.ip || 'local'
    });

    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Delete Branch',
      details: `Deleted branch ${branch.name}`,
      ipAddress: req.ip || 'local'
    });

    res.status(200).json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
