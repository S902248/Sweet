import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Search, Package, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';

const Products = ({ selectedBranch }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bengali sweets');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [barcode, setBarcode] = useState('');
  const [expiryDays, setExpiryDays] = useState('3'); // default shelf life in days

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
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?.name || 'Bengali sweets');
    setPrice('');
    setCostPrice('');
    setStock('');
    setLowStockThreshold('10');
    setBarcode('');
    setExpiryDays('3');
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setCostPrice(p.costPrice || '');
    setStock(p.stock);
    setLowStockThreshold(p.lowStockThreshold || '10');
    setBarcode(p.barcode || '');
    // Calculate expiry days remaining
    if (p.expiryDate) {
      const days = Math.round((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      setExpiryDays(days > 0 ? days.toString() : '3');
    } else {
      setExpiryDays('3');
    }
    setShowProductModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return;

    // Calculate expiry date based on shelf life days
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + Number(expiryDays));

    const payload = {
      name,
      category,
      price: Number(price),
      costPrice: costPrice ? Number(costPrice) : Number(price) * 0.6,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      barcode,
      expiryDate: expDate.toISOString(),
      branchId: selectedBranch || 'mock_branch_1'
    };

    try {
      if (editingProduct) {
        // Edit product
        const id = editingProduct._id || editingProduct.id;
        const res = await api.put(`/products/${id}`, payload);
        if (res.data.success) {
          setProducts(products.map(p => (p._id === id || p.id === id) ? res.data.data : p));
        }
      } else {
        // Create product
        const res = await api.post('/products', payload);
        if (res.data.success) {
          setProducts([...products, res.data.data]);
        }
      }
      setShowProductModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== id && p.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search catalog by name/category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4.5 h-4.5" /> Add New Sweet Product
        </button>
      </div>

      {/* Catalog Table */}
      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Sweet Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Rate</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {filteredProducts.map(p => (
                <tr key={p._id || p.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">{p.name}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{p.category}</td>
                  <td className="py-3.5 px-4 font-black text-slate-800 dark:text-white">Rs. {p.price}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-semibold">Rs. {p.costPrice || Math.round(p.price * 0.6)}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{p.barcode || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.stock <= p.lowStockThreshold 
                        ? 'bg-rose-500/10 text-rose-500' 
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p._id || p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit/Create Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-lg w-full space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                {editingProduct ? 'Edit Product Details' : 'Add Sweet Product'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure name, pricing tiers, and shelf limits</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sondesh"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Selling Price (Rs.)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Rate per kg/pcs"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Cost Price (Rs. - Opt.)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="Base ingredient cost"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Available stock"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Low Stock Alert Limit</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="Default is 10"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Barcode Value</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Shelf Life (Days)</label>
                  <input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    placeholder="Days remaining before expiry"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
