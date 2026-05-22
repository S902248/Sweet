import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearError } from '../store/slices/authSlice.js';
import { Coffee, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(loginStart());
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        dispatch(loginSuccess({
          user: {
            _id: res.data.data._id,
            username: res.data.data.username,
            email: res.data.data.email,
            role: res.data.data.role,
            branchId: res.data.data.branchId
          },
          token: res.data.data.token
        }));
        navigate('/dashboard');
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed. Please check credentials.'));
    }
  };

  // Pre-fill quick logins for easy evaluation!
  const quickLogins = [
    { label: 'Super Admin', email: 'admin@sweetflow.com', desc: 'Manage all branches' },
    { label: 'Manager', email: 'manager@sweetflow.com', desc: 'Manage Salt Lake Branch' },
    { label: 'Cashier', email: 'cashier@sweetflow.com', desc: 'Billing & Orders' },
    { label: 'Inventory', email: 'inventory@sweetflow.com', desc: 'Stock & Alert checks' }
  ];

  const handleQuickLogin = async (emailAddress) => {
    setEmail(emailAddress);
    setPassword('password123');
    dispatch(loginStart());
    try {
      const res = await api.post('/auth/login', { email: emailAddress, password: 'password123' });
      if (res.data.success) {
        dispatch(loginSuccess({
          user: {
            _id: res.data.data._id,
            username: res.data.data.username,
            email: res.data.data.email,
            role: res.data.data.role,
            branchId: res.data.data.branchId
          },
          token: res.data.data.token
        }));
        navigate('/dashboard');
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed. Please check credentials.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-500/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-500/10 blur-[80px]" />

      <div className="w-full max-w-lg glass-card glass-modal p-8 md:p-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/20 text-white mb-4">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">SweetFlow ERP</h2>
          <p className="text-slate-400 mt-2 text-sm">Sign in to manage your sweet shop ecosystem</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sweetflow.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-white transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-white transition-all duration-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <p className="text-center text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Evaluation Quick Login</p>
          <div className="grid grid-cols-2 gap-3">
            {quickLogins.map((role) => (
              <button
                key={role.label}
                onClick={() => handleQuickLogin(role.email)}
                className="p-3 text-left rounded-xl bg-slate-900/30 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-900/70 transition-all duration-200"
              >
                <p className="text-xs font-bold text-white leading-none">{role.label}</p>
                <p className="text-[10px] text-slate-400 mt-1">{role.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
