import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../context/ThemeContext.jsx';
import { logout } from '../store/slices/authSlice.js';
import api from '../utils/api.js';
import {
  LayoutDashboard, ShoppingBag, Store, Users, Settings,
  TrendingUp, FolderOpen, ScrollText,
  ClipboardList, Bell, LogOut, Coffee, Menu, Truck, ChevronDown,
  Sun, Moon, Check, X
} from 'lucide-react';

const Navbar = ({ selectedBranch, setSelectedBranch }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const [branches, setBranches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState(null);

  const notifRef = useRef(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchBranches();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data.success) {
        setBranches(res.data.data);
        if (res.data.data.length > 0 && !selectedBranch) {
          const userBranch = res.data.data.find(b => b._id === user?.branchId || b.id === user?.branchId);
          setSelectedBranch(userBranch ? userBranch._id : res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.filter(n => !n.read));
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications([]);
      setShowNotifDropdown(false);
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const activeBranchName = branches.find(b => b._id === selectedBranch || b.id === selectedBranch)?.name || 'All Branches';

  const menuGroups = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Super Admin', 'Sweet Owner']
    },
    {
      name: 'Sales & POS',
      icon: ShoppingBag,
      roles: ['Super Admin', 'Sweet Owner'],
      items: [
        { name: 'Billing POS', path: '/pos', icon: ShoppingBag, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Orders Desk', path: '/orders', icon: ScrollText, roles: ['Super Admin', 'Sweet Owner'] }
      ]
    },
    {
      name: 'Inventory',
      icon: ClipboardList,
      roles: ['Super Admin', 'Sweet Owner'],
      items: [
        { name: 'Products', path: '/products', icon: FolderOpen, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Inventory', path: '/inventory', icon: ClipboardList, roles: ['Super Admin', 'Sweet Owner'] }
      ]
    },
    {
      name: 'People',
      icon: Users,
      roles: ['Super Admin', 'Sweet Owner'],
      items: [
        { name: 'Customers', path: '/customers', icon: Users, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Employees', path: '/employees', icon: Users, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Owners', path: '/owners', icon: Users, roles: ['Super Admin'] }
      ]
    },
    {
      name: 'Management',
      icon: Settings,
      roles: ['Super Admin', 'Sweet Owner'],
      items: [
        { name: 'Branches', path: '/branches', icon: Store, roles: ['Super Admin'] },
        { name: 'Reports', path: '/reports', icon: TrendingUp, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Settings', path: '/settings', icon: Settings, roles: ['Super Admin', 'Sweet Owner'] }
      ]
    }
  ];

  // Filter items based on user role
  const filteredGroups = menuGroups.map(group => {
    if (group.items) {
      const filteredItems = group.items.filter(item => user && item.roles.includes(user.role));
      return { ...group, items: filteredItems };
    }
    return group;
  }).filter(group => {
    if (!user) return false;
    if (group.items) return group.items.length > 0;
    return group.roles.includes(user.role);
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/50">
      {/* Main Navbar Row */}
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 max-w-[1800px] mx-auto">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 mr-4 lg:mr-6 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-lg shadow-brand-500/20 text-white">
              <Coffee className="w-4.5 h-4.5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base leading-none block text-slate-800 dark:text-white">SweetFlow</span>
              <span className="text-[10px] text-brand-500 font-semibold tracking-wider uppercase">ERP</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {filteredGroups.map((group) => {
              const Icon = group.icon;

              // Single link (no dropdown)
              if (group.path) {
                const isActive = location.pathname === group.path;
                return (
                  <Link
                    key={group.name}
                    to={group.path}
                    className={`nav-link-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{group.name}</span>
                  </Link>
                );
              }

              // Dropdown group
              const isAnyChildActive = group.items.some(item => location.pathname === item.path);

              return (
                <div key={group.name} className="nav-dropdown-group relative">
                  <button
                    className={`nav-link-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isAnyChildActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{group.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50 transition-transform duration-200 dropdown-chevron" />
                  </button>

                  {/* Hover Dropdown */}
                  <div className="nav-dropdown-menu absolute top-full left-0 pt-1.5 opacity-0 invisible translate-y-1 transition-all duration-200 ease-out">
                    <div className="min-w-[200px] rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-xl shadow-slate-200/30 dark:shadow-black/30 p-1.5 backdrop-blur-xl">
                      {group.items.map((item) => {
                        const isChildActive = location.pathname === item.path;
                        const ChildIcon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isChildActive
                                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-white'
                            }`}
                          >
                            <ChildIcon className={`w-4 h-4 ${isChildActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Branch Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/50">
            <Store className="w-4 h-4 text-brand-500" />
            {user?.role === 'Super Admin' ? (
              <select
                value={selectedBranch || ''}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent font-semibold text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[120px]"
              >
                <option value="" className="bg-white dark:bg-slate-900">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id} className="bg-white dark:bg-slate-900">{b.name}</option>
                ))}
              </select>
            ) : (
              <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                {activeBranchName}
              </span>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-500" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex w-4 h-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2 mb-2">
                  <span className="font-semibold text-sm">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-brand-500 hover:underline">
                      <Check className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge + Logout */}
          <div className="hidden sm:flex items-center gap-2 pl-2 lg:pl-3 border-l border-slate-200/50 dark:border-slate-800/40">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none">{user?.username}</p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 max-h-[70vh] overflow-y-auto">
          <nav className="p-3 space-y-1">
            {filteredGroups.map((group) => {
              const Icon = group.icon;

              if (group.path) {
                const isActive = location.pathname === group.path;
                return (
                  <Link
                    key={group.name}
                    to={group.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{group.name}</span>
                  </Link>
                );
              }

              const isExpanded = mobileExpandedGroup === group.name;
              const isAnyChildActive = group.items.some(item => location.pathname === item.path);

              return (
                <div key={group.name}>
                  <button
                    onClick={() => setMobileExpandedGroup(isExpanded ? null : group.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isAnyChildActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{group.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="ml-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800/50 space-y-0.5 mt-1 mb-1">
                      {group.items.map((item) => {
                        const isChildActive = location.pathname === item.path;
                        const ChildIcon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isChildActive
                                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile: Branch Selector */}
            <div className="sm:hidden pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-2 px-4 py-3">
                <Store className="w-5 h-5 text-brand-500" />
                {user?.role === 'Super Admin' ? (
                  <select
                    value={selectedBranch || ''}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="bg-transparent font-semibold text-sm text-slate-700 dark:text-slate-200 focus:outline-none flex-1"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">All Branches</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id} className="bg-white dark:bg-slate-900">{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{activeBranchName}</span>
                )}
              </div>
            </div>

            {/* Mobile: User + Logout */}
            <div className="sm:hidden pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {user?.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
