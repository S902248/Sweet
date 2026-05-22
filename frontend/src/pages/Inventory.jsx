import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, Calendar, Plus, Truck, Package, 
  Trash2, ShieldCheck, ClipboardCheck 
} from 'lucide-react';
import api from '../utils/api.js';

const Inventory = ({ selectedBranch }) => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Supplier Form State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [categorySupplied, setCategorySupplied] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, [selectedBranch]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const prodUrl = selectedBranch ? `/products?branchId=${selectedBranch}` : '/products';
      const prodRes = await api.get(prodUrl);
      if (prodRes.data.success) {
        setProducts(prodRes.data.data);
      }

      const supRes = await api.get('/suppliers');
      if (supRes.data.success) {
        setSuppliers(supRes.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const res = await api.post('/suppliers', {
        name, contactName, phone, email, address,
        categoriesSupplied: categorySupplied ? [categorySupplied] : []
      });
      if (res.data.success) {
        setSuppliers([...suppliers, res.data.data]);
        setShowSupplierModal(false);
        // Reset form
        setName('');
        setContactName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setCategorySupplied('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating supplier');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!confirm('Are you sure you want to remove this supplier?')) return;
    try {
      const res = await api.delete(`/suppliers/${id}`);
      if (res.data.success) {
        setSuppliers(suppliers.filter(s => s._id !== id && s.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting supplier');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading inventory stats...</p>
      </div>
    );
  }

  // Filter low-stock
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  // Filter expired/upcoming expiry (within next 3 days)
  const expiryThreshold = new Date();
  expiryThreshold.setDate(expiryThreshold.getDate() + 3);
  
  const expiryAlerts = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    return exp <= expiryThreshold;
  });

  return (
    <div className="space-y-8">
      {/* Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-rose-500">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Low Stock</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{lowStockProducts.length} Items</h3>
            <p className="text-[10px] text-slate-400 mt-1">Requires immediate replenishment</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-amber-500">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry Warnings</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{expiryAlerts.length} Items</h3>
            <p className="text-[10px] text-slate-400 mt-1">Expiring in less than 3 days</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-brand-500">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Suppliers</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{suppliers.length} Accounts</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold text-brand-500">Verified SweetFlow partners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Low Stock List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
            <div>
              <h3 className="font-extrabold text-lg">Low Stock Alerts</h3>
              <p className="text-xs text-slate-400">Products currently below replenishment threshold</p>
            </div>
            <Package className="w-5.5 h-5.5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">All product stocks are healthy!</p>
            ) : (
              lowStockProducts.map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <div>
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{p.name}</h4>
                    <span className="text-[10px] text-slate-400">{p.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-500 block">Stock: {p.stock} units</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Limit: {p.lowStockThreshold} units</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiry alerts */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
            <div>
              <h3 className="font-extrabold text-lg">Product Expiry Tracking</h3>
              <p className="text-xs text-slate-400">Perishables check (Bengali & milk sweets)</p>
            </div>
            <Calendar className="w-5.5 h-5.5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {expiryAlerts.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No sweets nearing expiration date</p>
            ) : (
              expiryAlerts.map(p => {
                const expDate = new Date(p.expiryDate);
                const isExpired = expDate < new Date();
                return (
                  <div key={p._id} className={`flex items-center justify-between p-3 rounded-xl ${isExpired ? 'bg-rose-500/5 border border-rose-500/10' : 'bg-amber-500/5 border border-amber-500/10'}`}>
                    <div>
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">{p.category}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${isExpired ? 'text-rose-500' : 'text-amber-500'}`}>
                        {isExpired ? 'Expired' : 'Expiring soon'}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {expDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Supplier Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
          <div>
            <h3 className="font-extrabold text-lg">Supplier Management</h3>
            <p className="text-xs text-slate-400">Manage flour, sugar, ghee, and milk dairy partners</p>
          </div>
          <button 
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-1 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-3 py-2 rounded-xl shadow-md shadow-brand-500/10"
          >
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Supplied Categories</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {suppliers.map(sup => (
                <tr key={sup._id || sup.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">{sup.name}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{sup.contactName}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{sup.phone}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {sup.categoriesSupplied?.map((cat, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-500/10 text-brand-500">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={() => handleDeleteSupplier(sup._id || sup.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-md w-full space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Register Supplier</h3>
              <p className="text-xs text-slate-400">Add a new supply chain partner</p>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Company Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Dairy"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Contact Person</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Amit Paul"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9830098300"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. amit@ananddairy.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Supplying Category</label>
                <input
                  type="text"
                  value={categorySupplied}
                  onChange={(e) => setCategorySupplied(e.target.value)}
                  placeholder="e.g. Bengali sweets, Dry sweets, Namkeen"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Gariahat Road, Kolkata"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
