import Order from '../models/Order.js';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

export const checkout = async (req, res) => {
  try {
    const { 
      branchId, 
      customerId, 
      customerPhone, 
      customerName, 
      items, 
      discountAmount, 
      paymentMethod,
      type, // Counter, Online, Delivery
      redeemPoints,
      upiId
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    // Calculate amounts
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Current stock: ${product.stock}` 
        });
      }
      totalAmount += product.price * item.quantity;
    }

    // Flat 5% GST on sweet items
    const taxRate = 0.05; 
    
    // Evaluate loyalty points redemption
    let loyaltyDiscount = 0;
    let redeemedPoints = 0;
    if (customerPhone && redeemPoints) {
      const customer = await Customer.findOne({ phone: customerPhone });
      if (customer && customer.loyaltyPoints > 0) {
        const maxPointsRedeemable = Math.floor(totalAmount - (discountAmount || 0));
        redeemedPoints = Math.min(customer.loyaltyPoints, Math.max(0, maxPointsRedeemable));
        loyaltyDiscount = redeemedPoints;
      }
    }

    const calculatedDiscount = Math.min(totalAmount, Math.max(0, (discountAmount || 0) + loyaltyDiscount));
    const taxableAmount = totalAmount - calculatedDiscount;
    const taxAmount = parseFloat((taxableAmount * taxRate).toFixed(2));
    const finalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));

    // Decrement inventory stock
    const io = req.app.get('io');
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const newStock = product.stock - item.quantity;
      await Product.findByIdAndUpdate(item.productId, { stock: newStock });

      // Trigger stock alerts if below limit and it wasn't already below limit
      if (newStock <= product.lowStockThreshold && product.stock > product.lowStockThreshold) {
        const alertMsg = `Low stock alert: Product ${product.name} is running low at ${newStock} units left.`;
        const notif = await Notification.create({
          title: 'Low Stock Alert',
          message: alertMsg,
          type: 'low_stock',
          branchId
        });
        if (io) io.emit('notification', notif);
      }
    }

    // Generate Invoice/Order Number
    const timestamp = Date.now().toString().substr(-6);
    const random = Math.floor(100 + Math.random() * 900);
    const orderNumber = `SF-${timestamp}-${random}`;
    const invoiceNumber = `INV-${timestamp}-${random}`;

    // Create Order
    const order = await Order.create({
      orderNumber,
      branchId,
      customerId,
      customerPhone: customerPhone || '',
      items,
      totalAmount,
      discountAmount: calculatedDiscount,
      taxAmount,
      finalAmount,
      paymentMethod,
      paymentStatus: 'Completed',
      status: type === 'Counter' ? 'Completed' : 'Pending',
      type: type || 'Counter'
    });

    // Create Invoice Bill
    const bill = await Bill.create({
      invoiceNumber,
      orderId: order._id,
      customerId,
      customerPhone: customerPhone || '',
      customerName: customerName || 'Walk-in Customer',
      branchId,
      subtotal: totalAmount,
      taxAmount,
      discount: calculatedDiscount,
      totalAmount: finalAmount,
      paymentMethod,
      paymentStatus: 'Paid',
      pdfUrl: `/api/billing/invoice/${invoiceNumber}/pdf`, // Mock PDF receipt endpoint
      upiId: upiId || 'sweetflow@ybl'
    });

    // Process Loyalty points (1 point for every 100 Rs spent, minus redeemed points)
    if (customerPhone) {
      const addedPoints = Math.floor(finalAmount / 100);
      let customer = await Customer.findOne({ phone: customerPhone });
      if (customer) {
        const newPoints = Math.max(0, customer.loyaltyPoints - redeemedPoints) + addedPoints;
        const newTotal = customer.totalPurchases + finalAmount;

        // Upgrade membership status based on points or total spend
        let membership = customer.membershipType;
        if (newTotal >= 20000) membership = 'Platinum';
        else if (newTotal >= 10000) membership = 'Gold';
        else if (newTotal >= 5000) membership = 'Silver';

        await Customer.findByIdAndUpdate(customer._id, {
          loyaltyPoints: newPoints,
          totalPurchases: newTotal,
          membershipType: membership
        });
      } else {
        // Create new customer profile
        let membership = 'Regular';
        if (finalAmount >= 20000) membership = 'Platinum';
        else if (finalAmount >= 10000) membership = 'Gold';
        else if (finalAmount >= 5000) membership = 'Silver';

        await Customer.create({
          name: customerName || 'Walk-in Customer',
          phone: customerPhone,
          loyaltyPoints: addedPoints, // cannot redeem if they were not registered
          membershipType: membership,
          totalPurchases: finalAmount
        });
      }
    }

    // Trigger realtime order updates
    if (io) {
      io.emit('new_order', { order, bill });
    }

    // Audit Log
    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'POS Transaction',
      details: `Generated Bill ${invoiceNumber} totaling Rs. ${finalAmount}`,
      ipAddress: req.ip || 'local'
    });

    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      data: { order, bill }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBills = async (req, res) => {
  try {
    const { branchId } = req.query;
    let query = {};
    if (branchId) query.branchId = branchId;
    const bills = await Bill.find(query);
    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
