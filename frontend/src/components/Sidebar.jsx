import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';
import {
  LayoutDashboard, ShoppingBag, Store, Users, Settings,
  AlertTriangle, TrendingUp, FolderOpen, ScrollText,
  ClipboardList, Bell, LogOut, Coffee, Menu, Truck, ChevronDown, Tag
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

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
      name: 'Inventory & Products',
      icon: ClipboardList,
      roles: ['Super Admin', 'Sweet Owner'],
      items: [
        { name: 'Products', path: '/products', icon: FolderOpen, roles: ['Super Admin', 'Sweet Owner'] },
        { name: 'Categories', path: '/categories', icon: Tag, roles: ['Super Admin', 'Sweet Owner'] },
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

  const handleLogout = () => {
    dispatch(logout());
  };

  // Filter items based on user role and groups
  const filteredGroups = menuGroups.map(group => {
    if (group.items) {
      const filteredItems = group.items.filter(item => user && item.roles.includes(user.role));
      return { ...group, items: filteredItems };
    }
    return group;
  }).filter(group => {
    if (!user) return false;
    if (group.items) {
      return group.items.length > 0;
    }
    return group.roles.includes(user.role);
  });

  // Initialize state tracking for open/expanded groups
  const [expandedGroups, setExpandedGroups] = useState({});

  // Auto-expand group that contains active path on mount or route change
  useEffect(() => {
    const activeGroup = filteredGroups.find(group =>
      group.items && group.items.some(item => item.path === location.pathname)
    );
    if (activeGroup) {
      setExpandedGroups(prev => ({
        ...prev,
        [activeGroup.name]: true
      }));
    }
  }, [location.pathname]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            {localStorage.getItem('shopLogo') ? (
              <img src={localStorage.getItem('shopLogo')} alt="Logo" className="h-10 w-auto max-w-[8rem] object-contain shrink-0" />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-bold text-lg leading-tight block text-slate-800 dark:text-white">
                {localStorage.getItem('shopName') || 'SweetFlow'}
              </span>
              <span className="text-[10px] text-brand-500 font-semibold tracking-wider uppercase">ERP SaaS</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredGroups.map((group) => {
            const Icon = group.icon;
            if (group.path) {
              const isActive = location.pathname === group.path;
              return (
                <Link
                  key={group.name}
                  to={group.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'}`} />
                  <span>{group.name}</span>
                </Link>
              );
            }

            const isExpanded = !!expandedGroups[group.name];
            const isAnyChildActive = group.items.some(item => location.pathname === item.path);

            return (
              <div key={group.name} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${isAnyChildActive
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isAnyChildActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{group.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="pl-6 space-y-1 border-l border-slate-100 dark:border-slate-800/50 ml-6">
                    {group.items.map((item) => {
                      const isChildActive = location.pathname === item.path;
                      const ChildIcon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isChildActive
                            ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/30'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                            }`}
                        >
                          <ChildIcon className={`w-4 h-4 ${isChildActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info / Logout Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/20">
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">{user.username}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
