import React, { useEffect, useState } from 'react';
import { Users, Award, ShieldCheck, Mail, Send, Search } from 'lucide-react';
import api from '../utils/api.js';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Notification modal simulation
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setLoading(false);
    }
  };

  const triggerSMS = (cust) => {
    setActiveCustomer(cust);
    setNotificationMsg(`Namaste ${cust.name}! Thanks for choosing SweetFlow! You have accumulated ${cust.loyaltyPoints} loyalty points. Keep shopping for sweet rewards!`);
    setShowNotifModal(true);
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    alert(`WhatsApp & SMS Notification sent successfully to ${activeCustomer.name} (${activeCustomer.phone})!`);
    setShowNotifModal(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading CRM records...</p>
      </div>
    );
  }

  // Filter list
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-brand-500 bg-brand-500/10 px-3.5 py-2 rounded-xl font-bold">
          <Users className="w-4.5 h-4.5" /> {customers.length} Registered CRM Profiles
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(cust => (
          <div key={cust._id || cust.id} className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{cust.name}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{cust.phone}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                cust.membershipType === 'Platinum'
                  ? 'bg-indigo-500/15 text-indigo-500'
                  : cust.membershipType === 'Gold'
                  ? 'bg-amber-500/15 text-amber-500'
                  : cust.membershipType === 'Silver'
                  ? 'bg-slate-500/20 text-slate-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {cust.membershipType} Tier
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800/40 py-3.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Loyalty Points</span>
                <p className="text-sm font-bold text-brand-500 flex items-center gap-1 mt-0.5">
                  <Award className="w-4 h-4" /> {cust.loyaltyPoints} pts
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Purchases</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  Rs. {Math.round(cust.totalPurchases)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => triggerSMS(cust)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> SMS & WhatsApp Alert
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp/SMS Simulation Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-md w-full space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Compose WhatsApp/SMS</h3>
              <p className="text-xs text-slate-400 mt-1">To: {activeCustomer?.name} ({activeCustomer?.phone})</p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Message Text</label>
                <textarea
                  value={notificationMsg}
                  onChange={(e) => setNotificationMsg(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotifModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
