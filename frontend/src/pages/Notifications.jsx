import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Calendar, Info } from 'lucide-react';
import api from '../utils/api.js';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(notifications.map(n => (n._id === id || n.id === id) ? res.data.data : n));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.post('/notifications/read-all');
      if (res.data.success) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading notification feed...</p>
      </div>
    );
  }

  const getIcon = (type) => {
    if (type === 'low_stock') return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    if (type === 'expiry_alert') return <Calendar className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-brand-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">System Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time alerts for low stock limits and sweet expiry warnings</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-bold px-3.5 py-2 border border-brand-500/10 rounded-xl hover:bg-brand-500/5 transition-all"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-semibold">No notifications yet</p>
            <p className="text-xs">Alerts will trigger once sweet stock levels drop or inventory items expire.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id || n.id} 
              className={`glass-card p-5 flex items-start justify-between gap-4 border transition-all ${
                n.read 
                  ? 'opacity-60 border-slate-200/30 dark:border-slate-800/20' 
                  : 'border-brand-500/20 shadow-md shadow-brand-500/5 bg-brand-500/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  n.type === 'low_stock' 
                    ? 'bg-rose-500/10' 
                    : n.type === 'expiry_alert' 
                    ? 'bg-amber-500/10' 
                    : 'bg-brand-500/10'
                }`}>
                  {getIcon(n.type)}
                </div>
                
                <div>
                  <h4 className={`font-bold text-sm ${n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>{n.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-2 font-medium">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n._id || n.id)}
                  title="Mark as Read"
                  className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
