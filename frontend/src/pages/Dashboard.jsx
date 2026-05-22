import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  TrendingUp, ShoppingBag, Store, AlertTriangle, 
  Clock, DollarSign, Award, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import api from '../utils/api.js';

const Dashboard = ({ selectedBranch }) => {
  const { user } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBranch]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const url = selectedBranch ? `/analytics/stats?branchId=${selectedBranch}` : '/analytics/stats';
      const statsRes = await api.get(url);
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch audit logs if super admin
      if (user?.role === 'Super Admin') {
        const logsRes = await api.get('/auth/logs');
        if (logsRes.data.success) {
          setLogs(logsRes.data.data);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading executive dashboard...</p>
      </div>
    );
  }

  // Cards layout
  const cards = [
    { title: 'Total Revenue', value: `Rs. ${stats?.totalRevenue || 0}`, desc: 'Total sales completed', icon: DollarSign, color: 'from-brand-500 to-indigo-600', text: 'text-brand-500' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, desc: 'Across counter & delivery', icon: ShoppingBag, color: 'from-pink-500 to-rose-500', text: 'text-pink-500' },
    { title: 'Pending Bills', value: `Rs. ${stats?.pendingAmount || 0}`, desc: `${stats?.pendingBillsCount || 0} unpaid receipts`, icon: Clock, color: 'from-amber-500 to-yellow-500', text: 'text-amber-500' },
    { title: 'Active Branches', value: stats?.activeBranches || 0, desc: 'Outlets online', icon: Store, color: 'from-emerald-500 to-teal-500', text: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-600/10 via-indigo-600/5 to-transparent border border-brand-500/10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Welcome Back, {user?.username}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is a summary of your sweet shop network performance today.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Live Status Feed Connected</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card glass-card-hover p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{card.value}</h3>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.desc}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-lg shadow-brand-500/10`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Revenue Analysis</h3>
              <p className="text-xs text-slate-400 mt-0.5">Sales & profit records over the last 7 days</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> Growth positive
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesGraph || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" name="Est. Profit" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warning cards & Top Selling product */}
        <div className="glass-card p-6 flex flex-col justify-between gap-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Store Analytics</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quick warnings & leaderboards</p>
          </div>

          <div className="space-y-4">
            {/* Top Seller Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Award className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Top Selling Sweet</span>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mt-0.5">{stats?.topProduct || 'Kolkata Rosogolla'}</p>
              </div>
            </div>

            {/* Low Stock Warning Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent border border-rose-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Low Stock Alert</span>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mt-0.5">{stats?.lowStockCount || 0} Sweets running low</p>
              </div>
            </div>
          </div>

          {/* Mini profit widget */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/20 text-center">
            <span className="text-xs text-slate-400 font-semibold">Today's Profit Margin (Est.)</span>
            <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">Rs. {stats?.dailyProfit || 0}</h4>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center justify-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% from yesterday
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Audit Logs / Live Updates Panel */}
      {user?.role === 'Super Admin' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Security Audit Log</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recent system administration and cashier activities</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {logs.slice(0, 5).map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{log.userName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action.includes('Register') || log.action.includes('Create')
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : log.action.includes('Delete')
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-brand-500/10 text-brand-500'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">{log.details}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400 text-xs">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
