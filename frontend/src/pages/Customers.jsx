import React, { useEffect, useState } from 'react';
import { Users, Award, ShieldCheck, Mail, Send, Search, Plus, AlertCircle, Trash2 } from 'lucide-react';
import api from '../utils/api.js';
import { validateName, validatePhone, validateEmailOptional } from '../utils/validators.js';

const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-rose-500">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  ) : null;

const inputClass = (err) =>
  `w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border ${
    err
      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
  } rounded-xl focus:outline-none text-xs text-slate-700 dark:text-slate-200`;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Customer modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custMembership, setCustMembership] = useState('Regular');

  // Validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  // ── Add Customer ──────────────────────────────────────────
  const validate = (fields = { custName, custPhone, custEmail }) => ({
    custName: validateName(fields.custName, 'Customer Name'),
    custPhone: validatePhone(fields.custPhone),
    custEmail: validateEmailOptional(fields.custEmail),
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const resetForm = () => {
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustMembership('Regular');
    setErrors({});
    setTouched({});
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setTouched({ custName: true, custPhone: true, custEmail: true });
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    try {
      const res = await api.post('/customers', {
        name: custName,
        phone: custPhone,
        email: custEmail || undefined,
        membershipType: custMembership,
      });
      if (res.data.success) {
        setCustomers([...customers, res.data.data]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating customer');
    }
  };

  // ── Delete Customer ───────────────────────────────────────
  const handleDeleteCustomer = async (id) => {
    if (!confirm('Are you sure you want to delete this customer profile?')) return;
    try {
      const res = await api.delete(`/customers/${id}`);
      if (res.data.success) {
        setCustomers(customers.filter(c => c._id !== id && c.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting customer');
    }
  };

  // ── SMS / WhatsApp ────────────────────────────────────────
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
      {/* Search Header + Add Button */}
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-brand-500 bg-brand-500/10 px-3.5 py-2 rounded-xl font-bold">
            <Users className="w-4.5 h-4.5" /> {customers.length} Registered CRM Profiles
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-1 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10"
          >
            <Plus className="w-4.5 h-4.5" /> Add Customer
          </button>
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
                {cust.email && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {cust.email}
                  </p>
                )}
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
                  <Award className="w-4 h-4" /> {cust.loyaltyPoints || 0} pts
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Purchases</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  Rs. {Math.round(cust.totalPurchases || 0)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerSMS(cust)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> SMS & WhatsApp
              </button>
              <button
                onClick={() => handleDeleteCustomer(cust._id || cust.id)}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                title="Delete customer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Customer Modal ────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-md w-full space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Register New Customer</h3>
              <p className="text-xs text-slate-400 mt-1">Add a customer profile to the CRM with contact and membership details</p>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => { setCustName(e.target.value); if (touched.custName) setErrors(v => ({ ...v, custName: validateName(e.target.value, 'Customer Name') })); }}
                  onBlur={() => handleBlur('custName')}
                  placeholder="e.g. Arjun Sharma"
                  className={inputClass(touched.custName && errors.custName)}
                />
                <FieldError msg={touched.custName && errors.custName} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => { setCustPhone(e.target.value); if (touched.custPhone) setErrors(v => ({ ...v, custPhone: validatePhone(e.target.value) })); }}
                    onBlur={() => handleBlur('custPhone')}
                    placeholder="e.g. 9830098300"
                    maxLength={13}
                    className={inputClass(touched.custPhone && errors.custPhone)}
                  />
                  <FieldError msg={touched.custPhone && errors.custPhone} />
                </div>

                {/* Membership */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Membership Tier</label>
                  <select
                    value={custMembership}
                    onChange={(e) => setCustMembership(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => { setCustEmail(e.target.value); if (touched.custEmail) setErrors(v => ({ ...v, custEmail: validateEmailOptional(e.target.value) })); }}
                  onBlur={() => handleBlur('custEmail')}
                  placeholder="e.g. customer@email.com (optional)"
                  className={inputClass(touched.custEmail && errors.custEmail)}
                />
                <FieldError msg={touched.custEmail && errors.custEmail} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── WhatsApp/SMS Simulation Modal ─────────────────────── */}
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
