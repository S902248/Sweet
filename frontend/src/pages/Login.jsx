import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearError } from '../store/slices/authSlice.js';
import {
  Coffee,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Store,
  Shield,
  Activity,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-rose-500">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  ) : null;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const validateForm = (fields = { email, password }) => ({
    email: validateEmail(fields.email),
    password: validatePassword(fields.password),
  });

  const handleFormBlur = (field) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    setFormErrors(validateForm());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched({ email: true, password: true });
    const errs = validateForm();
    setFormErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

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

  const quickLogins = [
    { label: 'Super Admin', email: 'admin@sweetflow.com', desc: 'Manage all branches' },
    { label: 'Sweet Owner', email: 'owner1@sweetflow.com', desc: 'Manage assigned branch' }
  ];

  const handleQuickLogin = (emailAddress, e) => {
    if (e) e.preventDefault();
    setEmail(emailAddress);
    setPassword('password123');
    dispatch(clearError());
  };

  const features = [
    {
      title: "Multi-Branch Synchronization",
      desc: "Synchronize billing POS, employee assignments, and real-time stocks across all outlets instantly.",
      icon: <Store className="w-5 h-5 text-indigo-400" />
    },
    {
      title: "Automated Inventory Tracker",
      desc: "Never run out of supplies. Live stock operations trigger warnings for low stock levels and manage supplier channels.",
      icon: <Layers className="w-5 h-5 text-pink-400" />
    },
    {
      title: "Precision Sales Analytics",
      desc: "Acquire deep analytics of tax figures, sales trends, top-selling confections, and operational profit margins.",
      icon: <TrendingUp className="w-5 h-5 text-indigo-400" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center lg:grid lg:grid-cols-12 relative overflow-hidden select-none">

      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/25 blur-[130px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-400/20 blur-[130px] animate-pulse-glow pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay-light opacity-90 pointer-events-none" />

      {/* Left Panel: ERP Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-7 h-screen flex-col justify-between p-12 xl:p-16 relative overflow-hidden mesh-gradient-bg-light border-r border-slate-200/80">

        {/* Header Badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>SweetFlow Enterprise Suite v2.1</span>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">SweetFlow ERP</h1>
              <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-bold">System Operations</p>
            </div>
          </div>
        </div>

        {/* Features Carousel (Centered in middle space) */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative bg-white/90 backdrop-blur-xl border border-white/40 p-8 rounded-2xl animate-float shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                {features[currentSlide].icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 transition-all duration-300">{features[currentSlide].title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed transition-all duration-300">{features[currentSlide].desc}</p>
              </div>
            </div>

            {/* Indicators */}
            <div className="flex items-center gap-1.5 mt-6 pl-16">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer (Desktop Left Panel) */}
        <div className="relative z-10 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SweetFlow ERP. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel: Clean Centered Login Form */}
      <div className="w-full lg:col-span-5 min-h-screen flex flex-col justify-center p-6 md:p-12 xl:p-16 relative z-10">

        {/* Mobile Header Branding */}
        <div className="lg:hidden flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 animate-float">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">SweetFlow ERP</h2>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage your sweet shop ecosystem</p>
        </div>

        {/* Main Login Form Container */}
        <div className="w-full max-w-md mx-auto">

          {/* Branding title (Desktop only) */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Portal</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Enter your credentials to secure access and initiate sales sessions.
            </p>
          </div>

          {/* Form Box Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/40 p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Email Address with Floating Label */}
              <div>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (formTouched.email) setFormErrors(v => ({ ...v, email: validateEmail(e.target.value) })); }}
                    onBlur={() => handleFormBlur('email')}
                    placeholder=" "
                    className={`peer w-full pl-11 pr-4 pt-6 pb-2 bg-white border ${
                      formTouched.email && formErrors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                        : 'border-slate-200/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    } rounded-xl outline-none text-slate-800 text-sm transition-all duration-200`}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-11 top-4 text-xs font-semibold text-slate-400 pointer-events-none transition-all duration-200 origin-left transform peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0.5 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-indigo-600"
                  >
                    Email Address
                  </label>
                  <span className="absolute left-3.5 top-4.5 text-slate-400 transition-colors peer-focus:text-indigo-600">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                </div>
                <FieldError msg={formTouched.email && formErrors.email} />
              </div>

              {/* Password with Floating Label + Toggle */}
              <div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (formTouched.password) setFormErrors(v => ({ ...v, password: validatePassword(e.target.value) })); }}
                    onBlur={() => handleFormBlur('password')}
                    placeholder=" "
                    className={`peer w-full pl-11 pr-11 pt-6 pb-2 bg-white border ${
                      formTouched.password && formErrors.password
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                        : 'border-slate-200/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    } rounded-xl outline-none text-slate-800 text-sm transition-all duration-200`}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-11 top-4 text-xs font-semibold text-slate-400 pointer-events-none transition-all duration-200 origin-left transform peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0.5 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-indigo-600"
                  >
                    Password
                  </label>
                  <span className="absolute left-3.5 top-4.5 text-slate-400 transition-colors peer-focus:text-indigo-600">
                    <Lock className="w-4.5 h-4.5" />
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-4 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <FieldError msg={formTouched.password && formErrors.password} />
              </div>

              {/* Remember & Forgot Row */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-500 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-white border-slate-200 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Remember Session</span>
                </label>
                <a href="#forgot" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot Password?
                </a>
              </div>

              {/* Login Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold transition-all duration-300 shadow-md shadow-indigo-500/10 hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to System</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick evaluation login section */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="h-px bg-slate-100 grow" />
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-3">Evaluation Quick Fill</span>
                <span className="h-px bg-slate-100 grow" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quickLogins.map((role) => {
                  const isSelected = email === role.email;
                  return (
                    <button
                      key={role.label}
                      type="button"
                      onClick={(e) => handleQuickLogin(role.email, e)}
                      className={`group flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-300 ${isSelected
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-800'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-slate-200/50 text-slate-500 group-hover:text-slate-600'
                        }`}>
                        {role.label === 'Super Admin' ? (
                          <Shield className="w-4 h-4" />
                        ) : (
                          <Store className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold truncate leading-tight">{role.label}</p>
                        <p className="text-[8px] text-slate-400 group-hover:text-slate-500 truncate mt-0.5">Click to Autofill</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Login;
