import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Settings, Shield, Store, CreditCard, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateBrandName, validateTaxRate, validateUPI } from '../utils/validators.js';

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
  } rounded-xl focus:outline-none text-xs text-slate-700 dark:text-slate-200 font-semibold`;

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);

  // Business profile states loaded dynamically from localStorage or defaults
  const [shopName, setShopName] = useState(localStorage.getItem('shopName') || 'SweetFlow ERP');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR (Rs.)');
  const [taxRate, setTaxRate] = useState(localStorage.getItem('taxRate') || '5');
  const [enableLoyalty, setEnableLoyalty] = useState(localStorage.getItem('enableLoyalty') !== 'false');
  const [upiId, setUpiId] = useState(localStorage.getItem('upiId') || 'sweetflow@ybl');

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const validate = (fields = { shopName, taxRate, upiId }) => ({
    shopName: validateBrandName(fields.shopName),
    taxRate: validateTaxRate(fields.taxRate),
    upiId: validateUPI(fields.upiId),
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTouched({ shopName: true, taxRate: true, upiId: true });
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    localStorage.setItem('shopName', shopName);
    localStorage.setItem('currency', currency);
    localStorage.setItem('taxRate', taxRate);
    localStorage.setItem('enableLoyalty', enableLoyalty);
    localStorage.setItem('upiId', upiId);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
            Security &amp; RBAC
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40">
            Hardware POS Sync
          </button>
        </div>

        {/* Right Settings Pane */}
        <div className="glass-card p-6 md:col-span-2">
          {/* Success banner */}
          {saveSuccess && (
            <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> System settings updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6" noValidate>
            <div className="border-b border-slate-100 dark:border-slate-800/50 pb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-500" />
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">Global Outlet Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  Brand Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => { setShopName(e.target.value); if (touched.shopName) setErrors(v => ({ ...v, shopName: validateBrandName(e.target.value) })); }}
                  onBlur={() => handleBlur('shopName')}
                  className={inputClass(touched.shopName && errors.shopName)}
                />
                <FieldError msg={touched.shopName && errors.shopName} />
              </div>

              {/* Currency */}
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
              {/* GST Rate */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  Standard Sweet GST (%) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => { setTaxRate(e.target.value); if (touched.taxRate) setErrors(v => ({ ...v, taxRate: validateTaxRate(e.target.value) })); }}
                  onBlur={() => handleBlur('taxRate')}
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputClass(touched.taxRate && errors.taxRate)}
                />
                <FieldError msg={touched.taxRate && errors.taxRate} />
              </div>

              {/* UPI ID */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  UPI ID for Scanner (Payments) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => { setUpiId(e.target.value); if (touched.upiId) setErrors(v => ({ ...v, upiId: validateUPI(e.target.value) })); }}
                  onBlur={() => handleBlur('upiId')}
                  placeholder="merchant@ybl"
                  className={inputClass(touched.upiId && errors.upiId)}
                />
                <FieldError msg={touched.upiId && errors.upiId} />
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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
