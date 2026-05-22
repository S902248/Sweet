import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, ShoppingCart, Trash2, CreditCard, DollarSign, 
  QrCode, FileText, Send, Sparkles, AlertCircle, Wifi, WifiOff 
} from 'lucide-react';
import api from '../utils/api.js';

const BillingPOS = ({ selectedBranch }) => {
  const { user } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineBills, setOfflineBills] = useState([]);

  // Check offline queue
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline queue
    const savedQueue = localStorage.getItem('offline_bills');
    if (savedQueue) {
      setOfflineBills(JSON.parse(savedQueue));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedBranch]);

  const fetchProducts = async () => {
    try {
      const url = selectedBranch ? `/products?branchId=${selectedBranch}` : '/products';
      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Simulating barcode scanner
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeQuery) return;
    const match = products.find(p => p.barcode === barcodeQuery);
    if (match) {
      addToCart(match);
      setBarcodeQuery('');
    } else {
      alert(`Barcode ${barcodeQuery} not recognized`);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert(`${product.name} is out of stock!`);
      return;
    }
    const exist = cart.find(item => item.productId === product._id || item.productId === product.id);
    if (exist) {
      if (exist.quantity >= product.stock) {
        alert(`Cannot add more. Available stock limit reached: ${product.stock}`);
        return;
      }
      setCart(cart.map(item => 
        (item.productId === product._id || item.productId === product.id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const updateQuantity = (id, amount) => {
    const item = cart.find(i => i.productId === id);
    const product = products.find(p => p._id === id || p.id === id);
    if (!item || !product) return;

    const newQty = item.quantity + amount;
    if (newQty <= 0) {
      removeFromCart(id);
    } else if (newQty > product.stock) {
      alert(`Insufficient stock. Available limit is ${product.stock}`);
    } else {
      setCart(cart.map(i => i.productId === id ? { ...i, quantity: newQty } : i));
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = parseFloat(((subtotal - discount) * 0.05).toFixed(2));
  const total = parseFloat((subtotal - discount + tax).toFixed(2));

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const billPayload = {
      branchId: selectedBranch || user?.branchId || 'mock_branch_1',
      customerId: null,
      customerPhone,
      customerName: customerName || 'Walk-in Customer',
      items: cart,
      discountAmount: Number(discount),
      paymentMethod,
      type: 'Counter'
    };

    // Offline billing sync logic!
    if (!isOnline) {
      const offlineQueue = [...offlineBills, { ...billPayload, _id: 'off_' + Date.now(), createdAt: new Date() }];
      localStorage.setItem('offline_bills', JSON.stringify(offlineQueue));
      setOfflineBills(offlineQueue);
      
      // Clear cart
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      alert('Network offline. Invoice queued for offline sync!');
      return;
    }

    try {
      if (paymentMethod === 'UPI' && !showQrModal) {
        // Trigger UPI payment QR code simulator
        setQrValue(`upi://pay?pa=sweetflow@ybl&pn=SweetFlow%20ERP&am=${total}&tn=SweetFlowInvoice`);
        setShowQrModal(true);
        return;
      }

      const res = await api.post('/billing/checkout', billPayload);
      if (res.data.success) {
        setShowQrModal(false);
        // Reset POS
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscount(0);
        
        // Open PDF receipt in new window
        const invoiceNum = res.data.data.bill.invoiceNumber;
        window.open(`http://localhost:5000/api/billing/invoice/${invoiceNum}/pdf`, '_blank');
        
        // Refresh products list to reflect new stocks
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing checkout');
    }
  };

  const syncOfflineBills = async () => {
    if (offlineBills.length === 0) return;
    let successCount = 0;
    const remaining = [];

    for (let bill of offlineBills) {
      try {
        const res = await api.post('/billing/checkout', bill);
        if (res.data.success) {
          successCount++;
        } else {
          remaining.push(bill);
        }
      } catch (err) {
        remaining.push(bill);
      }
    }

    localStorage.setItem('offline_bills', JSON.stringify(remaining));
    setOfflineBills(remaining);
    fetchProducts();
    alert(`Sync completed. Successfully pushed ${successCount} offline invoices to server.`);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Products Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* Search, Barcode & Network State banner */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search sweet items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          {/* Barcode Simulator */}
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2 w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Simulate barcode scan (e.g. 8901234567890)"
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-mono"
            />
            <button type="submit" className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
              Scan
            </button>
          </form>

          {/* Network Connection Mode */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <Wifi className="w-3.5 h-3.5" /> Online Mode
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-full">
                <WifiOff className="w-3.5 h-3.5" /> Offline Mode
              </span>
            )}

            {offlineBills.length > 0 && isOnline && (
              <button 
                onClick={syncOfflineBills}
                className="text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md shadow-brand-500/10"
              >
                Sync ({offlineBills.length})
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-1.5">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              !selectedCategory 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' 
                : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat.name
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredProducts.map(p => (
            <button
              key={p._id}
              onClick={() => addToCart(p)}
              className="glass-card p-4 text-left glass-card-hover border border-slate-200/40 dark:border-slate-800/30 flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wide">{p.category}</span>
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mt-1">{p.name}</h4>
              </div>
              <div className="flex items-end justify-between mt-3 w-full">
                <span className="font-black text-slate-800 dark:text-white text-base">Rs. {p.price}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  p.stock <= p.lowStockThreshold 
                    ? 'bg-rose-500/15 text-rose-500' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}>
                  Stock: {p.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Column */}
      <div className="lg:col-span-4 glass-card p-6 space-y-6 sticky top-24">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/50">
          <ShoppingCart className="w-5.5 h-5.5 text-brand-500" />
          <h3 className="font-extrabold text-lg">Billing Cart</h3>
        </div>

        {/* Customer Info */}
        <div className="space-y-3.5">
          <input
            type="text"
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
          />
          <input
            type="text"
            placeholder="Customer Phone (For Loyalty Points)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
          />
        </div>

        {/* Cart Items List */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-10">Cart is empty. Click items on the left to add.</p>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
                <div className="truncate pr-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                  <span className="text-[10px] text-slate-400">Rs. {item.price} each</span>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="px-2.5 py-0.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="px-2.5 py-0.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">Rs. {subtotal}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Discount</span>
            <input 
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              className="w-16 text-right px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-brand-500 font-semibold"
            />
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">GST (Flat 5%)</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">Rs. {tax}</span>
          </div>

          <div className="flex justify-between text-base font-black border-t border-slate-100 dark:border-slate-800/50 pt-3 text-slate-800 dark:text-white">
            <span>Total</span>
            <span className="text-brand-500">Rs. {total}</span>
          </div>
        </div>

        {/* Payment Select & Action */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Cash', icon: DollarSign },
                { name: 'Card', icon: CreditCard },
                { name: 'UPI', icon: QrCode }
              ].map(opt => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setPaymentMethod(opt.name)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                    paymentMethod === opt.name
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" /> Generate Invoice
          </button>
        </div>
      </div>

      {/* UPI QR Payment Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-sm w-full text-center space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Scan & Pay</h3>
              <p className="text-xs text-slate-400 mt-1">UPI Merchant Code Invoice Gateway</p>
            </div>

            {/* Custom Styled QR simulator */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 max-w-[200px] mx-auto shadow-sm">
              <div className="w-40 h-40 bg-slate-800 flex items-center justify-center text-white relative">
                {/* Simulated QR boxes */}
                <div className="absolute top-2 left-2 w-10 h-10 border-4 border-white" />
                <div className="absolute top-2 right-2 w-10 h-10 border-4 border-white" />
                <div className="absolute bottom-2 left-2 w-10 h-10 border-4 border-white" />
                <Sparkles className="w-10 h-10 text-brand-500 animate-spin" />
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-2 font-mono">MERCHANT: SWEETFLOW@YBL</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">Total Amount Due</p>
              <h4 className="text-2xl font-black text-brand-500">Rs. {total}</h4>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleCheckout}
                className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Simulate Payment Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPOS;
