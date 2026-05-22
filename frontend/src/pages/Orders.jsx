import React, { useEffect, useState } from 'react';
import { ClipboardList, Clock, Truck, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import api from '../utils/api.js';

const Orders = ({ selectedBranch }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    
    // Poll orders desk every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [selectedBranch]);

  const fetchOrders = async () => {
    try {
      const url = selectedBranch ? `/orders?branchId=${selectedBranch}` : '/orders';
      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders(orders.map(o => (o._id === orderId || o.id === orderId) ? res.data.data : o));
        if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading live orders desk...</p>
      </div>
    );
  }

  // Get status color
  const getStatusBadge = (status) => {
    if (status === 'Pending') return 'bg-amber-500/10 text-amber-500';
    if (status === 'Preparing') return 'bg-indigo-500/10 text-indigo-500';
    if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-500';
    return 'bg-slate-500/10 text-slate-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Orders Desk */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/40">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Live Orders Desk</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time counter bills, online requests, and home deliveries</p>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
          {orders.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-20">No active orders found</p>
          ) : (
            orders.map(order => (
              <div 
                key={order._id || order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`glass-card p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border transition-all ${
                  selectedOrder?._id === order._id || selectedOrder?.id === order.id
                    ? 'border-brand-500 shadow-md shadow-brand-500/5 bg-brand-500/5'
                    : 'border-slate-200/40 dark:border-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">{order.orderNumber}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full">{order.type}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.items.length} items
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-black text-slate-800 dark:text-white text-base">Rs. {order.finalAmount}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order details panel */}
      <div className="lg:col-span-4 glass-card p-6 space-y-6 sticky top-24">
        {selectedOrder ? (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
              <h3 className="font-extrabold text-lg">Order Details</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedOrder.orderNumber}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Type</span>
                <span className="font-bold">{selectedOrder.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Channel</span>
                <span className="font-bold">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-bold">{selectedOrder.customerPhone || 'N/A'}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2.5 border-t border-b border-slate-100 dark:border-slate-800/50 py-4 max-h-40 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ordered Items</span>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">{item.name} <strong className="text-slate-700 dark:text-slate-200">x{item.quantity}</strong></span>
                  <span className="font-bold">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">GST (5%)</span>
                <span>Rs. {selectedOrder.taxAmount}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>Discount</span>
                  <span>- Rs. {selectedOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black border-t border-slate-100 dark:border-slate-800/50 pt-2 text-slate-800 dark:text-white">
                <span>Final Bill</span>
                <span className="text-brand-500">Rs. {selectedOrder.finalAmount}</span>
              </div>
            </div>

            {/* Status updates action */}
            {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Delivered' && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Advance Workflow</span>
                <div className="grid grid-cols-2 gap-3">
                  {selectedOrder.status === 'Pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder._id || selectedOrder.id, 'Preparing')}
                      className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10"
                    >
                      Start Preparing
                    </button>
                  )}
                  {selectedOrder.status === 'Preparing' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder._id || selectedOrder.id, 'Completed')}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10"
                    >
                      Ready for Dispatch
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-2">
            <ClipboardList className="w-10 h-10 text-slate-300" />
            <p className="text-xs">Select an active order card from the desk to view billing breakdowns and trigger statuses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
