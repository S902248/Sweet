import Order from '../models/Order.js';
import ActivityLog from '../models/ActivityLog.js';

export const getOrders = async (req, res) => {
  try {
    const { branchId, type, status } = req.query;
    let query = {};
    if (branchId) query.branchId = branchId;
    if (type) query.type = type;
    if (status) query.status = status;

    const orders = await Order.find(query);
    // Sort newest first
    const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ success: true, data: sortedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Pending, Preparing, Completed, Delivered

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_update', order);
    }

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Update Order Status',
      details: `Updated Order ${order.orderNumber} status to ${status}`,
      ipAddress: req.ip || 'local'
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
