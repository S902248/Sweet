import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Settings, Shield, Store, CreditCard, Save, Printer, Upload } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('store');

  // Business profile states loaded dynamically from localStorage or defaults
  const [shopName, setShopName] = useState(localStorage.getItem('shopName') || 'SweetFlow ERP');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR (Rs.)');
  const [taxRate, setTaxRate] = useState(localStorage.getItem('taxRate') || '5');
  const [enableLoyalty, setEnableLoyalty] = useState(localStorage.getItem('enableLoyalty') !== 'false');
  const [upiId, setUpiId] = useState(localStorage.getItem('upiId') || 'sweetflow@ybl');
  const [logoBase64, setLogoBase64] = useState(localStorage.getItem('shopLogo') || '');

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStore = (e) => {
    e.preventDefault();
    localStorage.setItem('shopName', shopName);
    localStorage.setItem('currency', currency);
    localStorage.setItem('taxRate', taxRate);
    localStorage.setItem('enableLoyalty', enableLoyalty);
    localStorage.setItem('upiId', upiId);
    if (logoBase64) localStorage.setItem('shopLogo', logoBase64);
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
          <button 
            onClick={() => setActiveTab('store')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'store' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'}`}
          >
            Store Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'}`}
          >
            Security & RBAC
          </button>
          <button 
            onClick={() => setActiveTab('hardware')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'hardware' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'}`}
          >
            Hardware POS Sync
          </button>
        </div>

        {/* Right Settings Pane */}
        <div className="glass-card p-6 md:col-span-2">
          {activeTab === 'store' && (
            <form onSubmit={handleSaveStore} className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/50 pb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-brand-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">Global Outlet Profile</h3>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
                  {logoBase64 ? (
                    <img src={logoBase64} alt="Store Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Store Logo</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used in billing receipts and website.</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Click the box to upload.</p>
                </div>
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

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">UPI ID for Scanner (Payments)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200 font-semibold"
                    placeholder="merchant@ybl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 pt-4">
                  <input
                    type="checkbox"
                    id="loyalty"
                    checked={enableLoyalty}
                    onChange={(e) => setEnableLoyalty(e.target.checked)}
                    className="w-4.5 h-4.5 accent-brand-500 rounded border-slate-200 dark:border-slate-800 focus:ring-brand-500/20 cursor-pointer"
                  />
                  <label htmlFor="loyalty" className="text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
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
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/50 pb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">Security & RBAC</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Require Admin PIN for Refunds</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cashiers will need an admin to approve refunds.</p>
                  </div>
                  <input type="checkbox" className="w-4.5 h-4.5 accent-brand-500 rounded border-slate-200" defaultChecked />
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Restrict Inventory Access</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Only Super Admins and Owners can manage inventory.</p>
                  </div>
                  <input type="checkbox" className="w-4.5 h-4.5 accent-brand-500 rounded border-slate-200" defaultChecked />
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 flex justify-end">
                <button className="flex items-center gap-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10">
                  <Save className="w-4 h-4" /> Save Security Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/50 pb-4 flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">Hardware POS Sync</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Receipt Printer IP (Optional)</label>
                  <input type="text" placeholder="192.168.1.100" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Barcode Scanner Type</label>
                  <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200">
                    <option>USB Scanner (Keyboard Wedge)</option>
                    <option>Bluetooth Serial</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2.5 pt-2">
                <input type="checkbox" id="cash_drawer" defaultChecked className="w-4.5 h-4.5 accent-brand-500 rounded border-slate-200 dark:border-slate-800" />
                <label htmlFor="cash_drawer" className="text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">
                  Kick Cash Drawer on Cash Sale
                </label>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 flex justify-end">
                <button className="flex items-center gap-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10">
                  <Save className="w-4 h-4" /> Save Hardware Config
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
