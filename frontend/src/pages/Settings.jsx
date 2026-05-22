import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Settings, Shield, Store, CreditCard, Save } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);

  // Business profile states
  const [shopName, setShopName] = useState('SweetFlow ERP');
  const [currency, setCurrency] = useState('INR (Rs.)');
  const [taxRate, setTaxRate] = useState('5');
  const [enableLoyalty, setEnableLoyalty] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    alert('System settings updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">ERP System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure business taxes, loyal points multiplier, and credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Nav column */}
        <div className="glass-card p-4 space-y-1">
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-md shadow-brand-500/10">
            Store Profile
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40">
            Security & RBAC
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40">
            Hardware POS Sync
          </button>
        </div>

        {/* Right Settings Pane */}
        <div className="glass-card p-6 md:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800/50 pb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-500" />
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">Global Outlet Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Brand Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Currency Unit</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="INR (Rs.)">INR (Rs.)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Standard Sweet GST (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200 font-semibold"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-4">
                <input
                  type="checkbox"
                  id="loyalty"
                  checked={enableLoyalty}
                  onChange={(e) => setEnableLoyalty(e.target.checked)}
                  className="w-4.5 h-4.5 accent-brand-500 rounded border-slate-200 dark:border-slate-800 focus:ring-brand-500/20 cursor-pointer"
                />
                <label htmlFor="loyalty" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                  Activate Loyalty point modules
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
