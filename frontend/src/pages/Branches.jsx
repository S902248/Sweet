import React, { useEffect, useState } from 'react';
import { Plus, Store, UserCheck, Shield, Trash2, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import { validateName, validateGST } from '../utils/validators.js';

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

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [managerId, setManagerId] = useState('');

  // Validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchBranches();
    fetchUsers();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data.success) {
        setBranches(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setManagers(res.data.data.filter(e => e.role === 'Branch Manager'));
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
    }
  };

  const validate = (fields = { name, gstNumber, address }) => ({
    name: validateName(fields.name, 'Branch Name'),
    gstNumber: validateGST(fields.gstNumber),
    address: fields.address?.trim() ? '' : 'Address is required.',
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setGstNumber('');
    setManagerId('');
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, gstNumber: true, address: true });
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    try {
      const res = await api.post('/branches', { name, address, gstNumber, managerId });
      if (res.data.success) {
        setBranches([...branches, res.data.data]);
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating branch');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this branch? All sales statistics and data for this branch will be detached.')) return;
    try {
      const res = await api.delete(`/branches/${id}`);
      if (res.data.success) {
        setBranches(branches.filter(b => b._id !== id && b.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting branch');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Multi-Branch Outlets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Super Admin dashboard to register and control sweet shop branches</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10"
        >
          <Plus className="w-4.5 h-4.5" /> Register Outlet
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(b => {
          const mgr = managers.find(m => m._id === b.managerId || m.id === b.managerId);
          return (
            <div key={b._id || b.id} className="glass-card p-6 flex flex-col justify-between min-h-[220px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                      <Store className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{b.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 uppercase tracking-wide">GST: {b.gstNumber}</p>
                    </div>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${b.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} title={b.isActive ? 'Active' : 'Inactive'} />
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-600 dark:text-slate-300">Address:</strong> {b.address}</p>
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-brand-500" />
                    <strong className="text-slate-600 dark:text-slate-300">Assigned Manager:</strong> {mgr ? mgr.name : 'Unassigned'}
                  </p>
                </div>

                {/* Outlet Statistics */}
                {b.stats && (
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Stock Remaining</span>
                      <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200 mt-0.5">{b.stats.totalStock} units</p>
                      <span className="text-[9px] text-slate-400 font-semibold">{b.stats.totalProducts} products</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total Sales</span>
                      <p className="font-extrabold text-sm text-emerald-500 mt-0.5">Rs. {b.stats.totalSales}</p>
                      <span className="text-[9px] text-slate-400 font-semibold">{b.stats.totalOrders} orders</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-6">
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Status: Active
                </span>
                <button 
                  onClick={() => handleDelete(b._id || b.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-md w-full space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Register Sweet Shop Outlet</h3>
              <p className="text-xs text-slate-400 mt-1">Configure name, address, GST, and assign a branch manager</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Branch Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                  Branch Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (touched.name) setErrors(v => ({ ...v, name: validateName(e.target.value, 'Branch Name') })); }}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Salt Lake Branch"
                  className={inputClass(touched.name && errors.name)}
                />
                <FieldError msg={touched.name && errors.name} />
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                  GST Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    setGstNumber(v);
                    if (touched.gstNumber) setErrors(prev => ({ ...prev, gstNumber: validateGST(v) }));
                  }}
                  onBlur={() => handleBlur('gstNumber')}
                  placeholder="e.g. 19AABCS1234F1Z1"
                  maxLength={15}
                  className={inputClass(touched.gstNumber && errors.gstNumber)}
                />
                <FieldError msg={touched.gstNumber && errors.gstNumber} />
              </div>

              {/* Assign Manager */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Assign Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="">Unassigned</option>
                  {managers.map(m => (
                    <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                  Address <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); if (touched.address) setErrors(v => ({ ...v, address: e.target.value.trim() ? '' : 'Address is required.' })); }}
                  onBlur={() => handleBlur('address')}
                  placeholder="e.g. Salt Lake, Sector V, Kolkata"
                  rows={3}
                  className={`${inputClass(touched.address && errors.address)} resize-none`}
                />
                <FieldError msg={touched.address && errors.address} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Register Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
