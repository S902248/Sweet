import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';
import { 
  LayoutDashboard, ShoppingBag, Store, Users, Settings, 
  AlertTriangle, TrendingUp, FolderOpen, ScrollText, 
  ClipboardList, Bell, LogOut, Coffee, Menu, Truck
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Branch Manager'] },
    { name: 'Billing POS', path: '/pos', icon: ShoppingBag, roles: ['Super Admin', 'Branch Manager', 'Cashier'] },
    { name: 'Inventory', path: '/inventory', icon: ClipboardList, roles: ['Super Admin', 'Branch Manager', 'Inventory Staff'] },
    { name: 'Products', path: '/products', icon: FolderOpen, roles: ['Super Admin', 'Branch Manager', 'Inventory Staff'] },
    { name: 'Branches', path: '/branches', icon: Store, roles: ['Super Admin'] },
    { name: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['Super Admin', 'Branch Manager', 'Inventory Staff'] },
    { name: 'Orders Desk', path: '/orders', icon: ScrollText, roles: ['Super Admin', 'Branch Manager', 'Cashier'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['Super Admin', 'Branch Manager', 'Cashier'] },
    { name: 'Employees', path: '/employees', icon: Users, roles: ['Super Admin', 'Branch Manager'] },
    { name: 'Reports', path: '/reports', icon: TrendingUp, roles: ['Super Admin', 'Branch Manager'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Super Admin', 'Branch Manager', 'Cashier', 'Inventory Staff'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Super Admin', 'Branch Manager', 'Cashier', 'Inventory Staff'] }
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  // Filter items based on user role
  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-lg shadow-brand-500/20 text-white">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none block text-slate-800 dark:text-white">SweetFlow</span>
              <span className="text-xs text-brand-500 font-semibold tracking-wider uppercase">ERP SaaS</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'}`} />
                <span>{item.name}</span>
              </Link>
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
