import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Plus, Key, Trash2, Edit2, Shield, User, Mail, Store } from 'lucide-react';
import api from '../utils/api.js';

const Owners = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  // Redirect if not Super Admin
  if (currentUser?.role !== 'Super Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingUserId, setEditingUserId] = useState(null);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sweet Owner');
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

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

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingUserId(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('Sweet Owner');
    setBranchId('');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setModalMode('edit');
    setEditingUserId(user._id || user.id);
    setUsername(user.username);
    setEmail(user.email);
    setPassword(''); // blank means don't change
    setRole(user.role);
    setBranchId(user.branchId || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || (modalMode === 'create' && !password)) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      username,
      email,
      role,
      branchId: role === 'Super Admin' ? null : (branchId || null)
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (modalMode === 'create') {
        const res = await api.post('/auth/users', payload);
        if (res.data.success) {
          fetchUsers();
          setShowModal(false);
        }
      } else {
        const res = await api.put(`/auth/users/${editingUserId}`, payload);
        if (res.data.success) {
          fetchUsers();
          setShowModal(false);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser._id || id === currentUser.id) {
      alert('You cannot delete your own logged-in account.');
      return;
    }
    if (!confirm('Are you sure you want to delete this account? They will lose access to the system immediately.')) return;

    try {
      const res = await api.delete(`/auth/users/${id}`);
      if (res.data.success) {
        setUsers(users.filter(u => u._id !== id && u.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">User Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Super Admin utility to manage login accounts, branch assignments, and passwords</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10"
        >
          <Plus className="w-4.5 h-4.5" /> Create Owner
        </button>
      </div>

      {/* Users table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-500/5 border-b border-slate-200/50 dark:border-slate-800/40">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide">Assigned Store</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {users.map(u => {
                const assignedBranch = branches.find(b => b._id === u.branchId || b.id === u.branchId);
                const isSelf = u._id === currentUser._id || u.id === currentUser.id;

                return (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs uppercase">
                          {u.username.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{u.username}</span>
                          {isSelf && (
                            <span className="ml-2 text-[9px] font-bold text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'Super Admin' 
                          ? 'bg-indigo-500/10 text-indigo-500' 
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {u.role === 'Super Admin' ? (
                        <span className="text-slate-400 italic">All Branches</span>
                      ) : assignedBranch ? (
                        <span className="flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          {assignedBranch.name}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Edit User & Password"
                          className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id || u.id)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot delete yourself' : 'Delete Account'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelf 
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                              : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-md w-full space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                {modalMode === 'create' ? 'Create Owner Account' : 'Edit User Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {modalMode === 'create' 
                  ? 'Set username, email, password and shop assignment for the new user' 
                  : 'Modify details or set a new password. Leave password blank if you do not wish to change it.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Raj sweetowner"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@sweetflow.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                  Password {modalMode === 'edit' && <span className="text-[9px] text-indigo-400">(Optional)</span>}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={modalMode === 'edit' ? '••••••••' : 'Password (min 6 chars)'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                    required={modalMode === 'create'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">System Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Shield className="w-4 h-4" />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (e.target.value === 'Super Admin') setBranchId('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <option value="Sweet Owner">Sweet Owner</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {role === 'Sweet Owner' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Assign Shop Branch</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Store className="w-4 h-4" />
                    </span>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <option value="">Unassigned (No access to POS/Reports)</option>
                      {branches.map(b => {
                        const branchIdStr = b._id || b.id;
                        const assignedUser = users.find(u => 
                          u.role === 'Sweet Owner' && 
                          u.branchId === branchIdStr && 
                          (modalMode === 'create' || (u._id !== editingUserId && u.id !== editingUserId))
                        );
                        return (
                          <option 
                            key={branchIdStr} 
                            value={branchIdStr}
                            disabled={!!assignedUser}
                          >
                            {b.name} {assignedUser ? `(Assigned to ${assignedUser.username})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Owners;
