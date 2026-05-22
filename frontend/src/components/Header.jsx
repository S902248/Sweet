import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, Bell, Menu, Store, Check, RefreshCw } from 'lucide-react';
import api from '../utils/api.js';

const Header = ({ toggleSidebar, selectedBranch, setSelectedBranch }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  
  const [branches, setBranches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchNotifications();

    // Poll for notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data.success) {
        setBranches(res.data.data);
        // Default to first branch if none selected and not Super Admin
        if (res.data.data.length > 0 && !selectedBranch) {
          // If manager, set to their branch, else first branch
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

  const activeBranchName = branches.find(b => b._id === selectedBranch || b.id === selectedBranch)?.name || 'All Branches';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar mobile */}
        <button onClick={toggleSidebar} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector */}
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-brand-500" />
          {user?.role === 'Super Admin' ? (
            <select
              value={selectedBranch || ''}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-semibold text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-900">All Branches</option>
              {branches.map(b => (
                <option key={b._id} value={b._id} className="bg-white dark:bg-slate-900">{b.name}</option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
              {activeBranchName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex w-4 h-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2 mb-2">
                <span className="font-semibold text-sm">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                  >
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

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/50 dark:border-slate-800/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none">{user?.username}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
