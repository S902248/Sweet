import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Search, User, Phone, Mail, MapPin, Tag, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import {
  validateName,
  validatePhoneOptional,
  validateEmailOptional,
} from '../utils/validators.js';

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

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [categoriesText, setCategoriesText] = useState('');

  // Validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      if (res.data.success) {
        setSuppliers(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCategoriesText('');
    setErrors({});
    setTouched({});
  };

  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    resetForm();
    setShowSupplierModal(true);
  };

  const handleOpenEditModal = (s) => {
    setEditingSupplier(s);
    setName(s.name);
    setContactName(s.contactName || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAddress(s.address || '');
    setCategoriesText(s.categoriesSupplied ? s.categoriesSupplied.join(', ') : '');
    setErrors({});
    setTouched({});
    setShowSupplierModal(true);
  };

  const validate = (fields = { name, phone, email }) => ({
    name: validateName(fields.name, 'Company Name'),
    phone: validatePhoneOptional(fields.phone),
    email: validateEmailOptional(fields.email),
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true });
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const categories = categoriesText
      ? categoriesText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name,
      contactName,
      phone,
      email,
      address,
      categoriesSupplied: categories
    };

    try {
      if (editingSupplier) {
        const id = editingSupplier._id || editingSupplier.id;
        const res = await api.put(`/suppliers/${id}`, payload);
        if (res.data.success) {
          setSuppliers(suppliers.map(s => (s._id === id || s.id === id) ? res.data.data : s));
        }
      } else {
        const res = await api.post('/suppliers', payload);
        if (res.data.success) {
          setSuppliers([...suppliers, res.data.data]);
        }
      }
      setShowSupplierModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing supplier record');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
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
        <p className="text-slate-400 text-sm">Loading supplier register...</p>
      </div>
    );
  }

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.contactName && s.contactName.toLowerCase().includes(search.toLowerCase())) ||
    (s.phone && s.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4.5 h-4.5" /> Add New Supplier
        </button>
      </div>

      {/* Grid of suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(s => (
          <div key={s._id || s.id} className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{s.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Rep: {s.contactName || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-350 border-t border-b border-slate-155/10 dark:border-slate-800/40 py-3.5">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{s.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{s.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{s.address || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Supplies categories</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {s.categoriesSupplied && s.categoriesSupplied.length > 0 ? (
                  s.categoriesSupplied.map((cat, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-500/10 text-brand-500 text-[10px] rounded-full font-bold">
                      <Tag className="w-2.5 h-2.5" /> {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400">N/A</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => handleOpenEditModal(s)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit details
              </button>
              <button 
                onClick={() => handleDeleteSupplier(s._id || s.id)}
                className="w-1/2 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                {editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure company name, contact info, and categories</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Company Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Company Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (touched.name) setErrors(v => ({ ...v, name: validateName(e.target.value, 'Company Name') })); }}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Anandam Sweets Wholesale"
                  className={inputClass(touched.name && errors.name)}
                />
                <FieldError msg={touched.name && errors.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Contact Person */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Contact Person</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Hari Lal"
                    className={inputClass(false)}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (touched.phone) setErrors(v => ({ ...v, phone: validatePhoneOptional(e.target.value) })); }}
                    onBlur={() => handleBlur('phone')}
                    placeholder="e.g. 9830098300"
                    maxLength={13}
                    className={inputClass(touched.phone && errors.phone)}
                  />
                  <FieldError msg={touched.phone && errors.phone} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (touched.email) setErrors(v => ({ ...v, email: validateEmailOptional(e.target.value) })); }}
                  onBlur={() => handleBlur('email')}
                  placeholder="e.g. supplier@domain.com"
                  className={inputClass(touched.email && errors.email)}
                />
                <FieldError msg={touched.email && errors.email} />
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sector V, Salt Lake, Kolkata"
                  className={inputClass(false)}
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Supplies Categories (Comma-separated)</label>
                <input
                  type="text"
                  value={categoriesText}
                  onChange={(e) => setCategoriesText(e.target.value)}
                  placeholder="e.g. Bengali sweets, Dry sweets, Namkeen"
                  className={inputClass(false)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowSupplierModal(false); resetForm(); }}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
