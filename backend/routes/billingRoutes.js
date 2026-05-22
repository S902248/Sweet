import express from 'express';
import { checkout, getBills } from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';
import Bill from '../models/Bill.js';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/checkout', protect, checkout);
router.get('/bills', protect, getBills);

// Mock Invoice PDF download route (renders clean receipt in HTML format)
router.get('/invoice/:invoiceNumber/pdf', async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const bill = await Bill.findOne({ invoiceNumber });
    if (!bill) {
      return res.status(404).send('Invoice not found');
    }

    const order = await Order.findById(bill.orderId);
    const dateStr = new Date(bill.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let itemsHtml = '';
    if (order && order.items) {
      order.items.forEach(item => {
        itemsHtml += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; text-align: left;">${item.name}</td>
            <td style="padding: 10px 0; text-align: center;">${item.quantity} kg/pcs</td>
            <td style="padding: 10px 0; text-align: right;">Rs. ${item.price}</td>
            <td style="padding: 10px 0; text-align: right;">Rs. ${item.price * item.quantity}</td>
          </tr>
        `;
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
          .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #5d5aeb; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; color: #5d5aeb; text-transform: uppercase; }
          .header p { margin: 5px 0 0 0; font-size: 14px; color: #666; }
          .meta { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 20px; line-height: 1.6; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
          .totals { font-size: 14px; text-align: right; line-height: 1.8; border-top: 2px solid #eee; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>SweetFlow ERP</h1>
            <p>Premium Sweet Shop Management System</p>
          </div>
          <div class="meta">
            <div>
              <strong>Invoice To:</strong><br/>
              ${bill.customerName}<br/>
              Phone: ${bill.customerPhone || 'N/A'}
            </div>
            <div style="text-align: right;">
              <strong>Invoice #:</strong> ${bill.invoiceNumber}<br/>
              <strong>Date:</strong> ${dateStr}<br/>
              <strong>Payment:</strong> ${bill.paymentMethod}
            </div>
          </div>
          <table class="table">
            <thead>
              <tr style="border-bottom: 2px solid #eee; font-weight: bold; color: #666;">
                <th style="padding: 10px 0; text-align: left;">Item Name</th>
                <th style="padding: 10px 0; text-align: center;">Qty</th>
                <th style="padding: 10px 0; text-align: right;">Rate</th>
                <th style="padding: 10px 0; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div>Subtotal: <strong>Rs. ${bill.subtotal}</strong></div>
            <div>Discount: <strong>- Rs. ${bill.discount}</strong></div>
            <div>GST (5%): <strong>Rs. ${bill.taxAmount}</strong></div>
            <div style="font-size: 18px; color: #5d5aeb; font-weight: bold; margin-top: 5px;">Total Amount: Rs. ${bill.totalAmount}</div>
          </div>
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>SweetFlow ERP SaaS Platform • Powered by MERN</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    res.status(500).send('Error rendering receipt invoice');
  }
});

export default router;
