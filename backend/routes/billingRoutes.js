import express from 'express';
import { checkout, getBills } from '../controllers/billingController.js';
import { protect, enforceBranchScope } from '../middleware/authMiddleware.js';
import Bill from '../models/Bill.js';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/checkout', protect, enforceBranchScope, checkout);
router.get('/bills', protect, enforceBranchScope, getBills);

// Mock Invoice PDF download route (renders clean receipt in HTML format)
router.get('/invoice/:invoiceNumber/pdf', protect, enforceBranchScope, async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const bill = await Bill.findOne({ invoiceNumber });
    if (!bill) {
      return res.status(404).send('Invoice not found');
    }

    const order = await Order.findById(bill.orderId);
    
    // Format date and time matching receipt style exactly
    const dateObj = new Date(bill.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    }).toLowerCase();

    let itemsHtml = '';
    if (order && order.items) {
      order.items.forEach(item => {
        itemsHtml += `
          <tr>
            <td style="text-align: left; padding: 4px 0;">${item.name}</td>
            <td style="text-align: center; padding: 4px 0;">${item.quantity}</td>
            <td style="text-align: right; padding: 4px 0;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      });
    }

    // Build functional UPI payment link for QR code
    const upiId = bill.upiId || 'sweetflow@ybl';
    const upiString = `upi://pay?pa=${upiId}&pn=SweetFlow ERP&am=${bill.totalAmount}&tn=Bill ${bill.invoiceNumber}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill ${invoiceNumber}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            color: #000;
            margin: 0;
            padding: 10px;
            background-color: #fff;
            font-size: 12px;
            line-height: 1.3;
          }
          .receipt {
            max-width: 290px;
            margin: 0 auto;
            padding: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
          }
          .header h2 {
            margin: 0;
            font-size: 15px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header p {
            margin: 3px 0 0 0;
            font-size: 10px;
            line-height: 1.3;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 3px double #000;
            margin: 6px 0;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 3px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 6px 0;
          }
          .items-table th {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
            font-size: 11px;
            font-weight: bold;
          }
          .items-table td {
            padding: 4px 0;
            font-size: 11px;
            vertical-align: top;
          }
          .totals-section {
            font-size: 11px;
            margin-top: 6px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .totals-row.grand-total {
            font-size: 13px;
            font-weight: bold;
            margin-top: 5px;
          }
          .upi-section {
            text-align: center;
            margin-top: 12px;
            margin-bottom: 8px;
          }
          .upi-title {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          .qr-code {
            width: 110px;
            height: 110px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 3px;
            background: white;
            display: block;
          }
          .upi-id {
            font-size: 9px;
            margin-top: 4px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 12px;
            font-size: 9px;
            line-height: 1.3;
          }
          .footer p {
            margin: 2px 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 2mm;
            }
            .receipt {
              max-width: 100%;
              width: 76mm;
            }
            @page {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <!-- Plate of sweets black & white line art SVG -->
            <svg viewBox="0 0 64 64" width="36" height="36" style="margin: 0 auto 4px auto; display: block; color: #000;">
              <ellipse cx="32" cy="48" rx="26" ry="6" fill="none" stroke="#000" stroke-width="3" />
              <circle cx="24" cy="38" r="8" fill="none" stroke="#000" stroke-width="3" />
              <line x1="20" y1="38" x2="28" y2="38" stroke="#000" stroke-width="2" />
              <circle cx="40" cy="38" r="8" fill="none" stroke="#000" stroke-width="3" />
              <line x1="36" y1="38" x2="44" y2="38" stroke="#000" stroke-width="2" />
              <circle cx="32" cy="26" r="7" fill="none" stroke="#000" stroke-width="3" />
              <line x1="28" y1="26" x2="36" y2="26" stroke="#000" stroke-width="2" />
            </svg>
            <h2>SweetFlow Sweet Shop</h2>
            <p>Sector 5, Hiranandani, Mumbai, MH</p>
            <p>Ph: 9876543210</p>
          </div>

          <div class="divider"></div>

          <div class="meta-row">
            <div>Bill: ${bill.invoiceNumber}</div>
            <div>${dateStr}</div>
          </div>
          <div class="meta-row">
            <div>Order ID: ${order?.orderNumber || 'N/A'}</div>
            <div>${timeStr}</div>
          </div>
          <div class="meta-row">
            <div>Customer: ${bill.customerName}</div>
            <div>${bill.customerPhone ? bill.customerPhone : 'N/A'}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 60%;">Item</th>
                <th style="text-align: center; width: 15%;">Qty</th>
                <th style="text-align: right; width: 25%;">Amt.</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="totals-section">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>Rs. ${bill.subtotal.toFixed(2)}</span>
            </div>
            ${bill.discount > 0 ? `
            <div class="totals-row">
              <span>Discount</span>
              <span>- Rs. ${bill.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="totals-row">
              <span>CGST (2.5%)</span>
              <span>Rs. ${(bill.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>SGST (2.5%)</span>
              <span>Rs. ${(bill.taxAmount / 2).toFixed(2)}</span>
            </div>
            
            <div class="double-divider"></div>
            
            <div class="totals-row grand-total">
              <span>TOTAL</span>
              <span>Rs. ${bill.totalAmount.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="font-weight: bold;">
              <span>Balance</span>
              <span>Rs. ${bill.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="upi-section">
            <div class="upi-title">SCAN TO PAY WITH UPI</div>
            <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(upiString)}" alt="UPI QR" />
            <div class="upi-id">UPI ID: ${upiId}</div>
          </div>

          <div class="divider"></div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>SweetFlow ERP SaaS Platform</p>
          </div>
        </div>

        ${req.query.noprint === 'true' ? '' : `
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
        `}
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
