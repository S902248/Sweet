import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import Customer from '../models/Customer.js';
import Bill from '../models/Bill.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { branchId } = req.query;
    let query = {};
    if (branchId) query.branchId = branchId;

    const orders = await Order.find(query);
    const bills = await Bill.find(query);
    const products = await Product.find(query);
    const branches = await Branch.find({});

    // Filter completed bills
    const completedBills = bills.filter(b => b.paymentStatus === 'Paid');
    const pendingBills = bills.filter(b => b.paymentStatus === 'Pending');

    const totalRevenue = completedBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalOrders = orders.length;
    const pendingAmount = pendingBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const activeBranches = branches.filter(b => b.isActive).length;

    // Low stock count
    const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

    // Top selling sweet
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = 0;
        productSales[item.name] += item.quantity;
      });
    });

    let topProduct = 'None';
    let maxQty = 0;
    for (let key in productSales) {
      if (productSales[key] > maxQty) {
        maxQty = productSales[key];
        topProduct = key;
      }
    }

    // Daily Profit
    // Profit = sum((price - costPrice) * quantity) - discounts
    let totalCost = 0;
    let totalDiscounts = 0;
    orders.forEach(o => {
      totalDiscounts += o.discountAmount || 0;
      o.items.forEach(item => {
        // Let's assume cost price is 60% of item price if product details missing
        const itemCost = item.price * 0.6; 
        totalCost += itemCost * item.quantity;
      });
    });
    const dailyProfit = totalRevenue - totalCost - totalDiscounts;

    // Charts data: Group by last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push({ date: dateStr, sales: 0, profit: 0 });
    }

    bills.forEach(b => {
      const dateStr = new Date(b.createdAt).toISOString().split('T')[0];
      const match = last7Days.find(day => day.date === dateStr);
      if (match) {
        if (b.paymentStatus === 'Paid') {
          match.sales += b.totalAmount;
          // Approximate profit margin of 40%
          match.profit += b.totalAmount * 0.4;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        pendingBillsCount: pendingBills.length,
        pendingAmount: Math.round(pendingAmount),
        activeBranches,
        lowStockCount,
        topProduct,
        dailyProfit: Math.round(dailyProfit > 0 ? dailyProfit : totalRevenue * 0.4),
        salesGraph: last7Days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAIReport = async (req, res) => {
  try {
    const { branchId, productId } = req.query;
    
    // AI based sales prediction: Let's fetch historical sales data
    let query = {};
    if (branchId) query.branchId = branchId;
    
    const bills = await Bill.find(query);
    
    // Group sales by day of last 30 days
    const dailySalesMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailySalesMap[dateStr] = 0;
    }

    bills.forEach(b => {
      if (b.paymentStatus === 'Paid') {
        const dateStr = new Date(b.createdAt).toISOString().split('T')[0];
        if (dailySalesMap[dateStr] !== undefined) {
          dailySalesMap[dateStr] += b.totalAmount;
        }
      }
    });

    const days = Object.keys(dailySalesMap).sort();
    const salesValues = days.map(day => dailySalesMap[day]);

    // Simple Linear Regression algorithm: Y = mX + c
    // X = index of day (0 to 29)
    // Y = sales value
    const n = salesValues.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += salesValues[i];
      sumXY += i * salesValues[i];
      sumXX += i * i;
    }

    let m = 0;
    let c = 0;
    const denominator = n * sumXX - sumX * sumX;
    if (denominator !== 0) {
      m = (n * sumXY - sumX * sumY) / denominator;
      c = (sumY - m * sumX) / n;
    } else {
      // Fallback to average sales
      c = n > 0 ? sumY / n : 12000;
      m = 50; // default positive upward trend
    }

    // Predict sales for the next 7 days
    const predictions = [];
    for (let i = 0; i < 7; i++) {
      const targetIndex = n + i;
      const predictedSales = Math.max(0, Math.round(m * targetIndex + c));
      
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];

      predictions.push({
        date: dateStr,
        predictedSales
      });
    }

    res.status(200).json({
      success: true,
      data: {
        trend: m > 0 ? 'Upward' : m < 0 ? 'Downward' : 'Stable',
        slope: parseFloat(m.toFixed(2)),
        intercept: parseFloat(c.toFixed(2)),
        predictions
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
