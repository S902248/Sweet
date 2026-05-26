import React, { useState, useEffect } from 'react';
import { Plus, Tag, Search, Trash2 } from 'lucide-react';
import api from '../utils/api.js';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const res = await api.post('/products/categories', { name: newCategoryName });
      if (res.data.success) {
        setCategories([...categories, res.data.data]);
        setNewCategoryName('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding category');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Controls */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category Name" 
            className="w-full md:w-64 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-sm" 
            required
          />
          <button type="submit" className="flex items-center justify-center gap-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/50 pb-4">
          <Tag className="w-5 h-5 text-brand-500" />
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">Product Categories</h3>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-10">
            <Tag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">No categories found</h3>
            <p className="text-xs text-slate-400 mt-1">Add a new category using the form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCategories.map(cat => (
              <div key={cat._id || cat.name} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center group hover:border-brand-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-500">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
