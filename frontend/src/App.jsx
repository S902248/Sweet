import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout } from './store/slices/authSlice.js';
import api from './utils/api.js';

// Layout
import Layout from './components/Layout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BillingPOS from './pages/BillingPOS.jsx';
import Inventory from './pages/Inventory.jsx';
import Products from './pages/Products.jsx';
import Branches from './pages/Branches.jsx';
import Orders from './pages/Orders.jsx';
import Customers from './pages/Customers.jsx';
import Employees from './pages/Employees.jsx';
import Reports from './pages/Reports.jsx';
import Notifications from './pages/Notifications.jsx';
import SettingsPage from './pages/Settings.jsx';
import Suppliers from './pages/Suppliers.jsx';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            dispatch(setUser(res.data.data));
          } else {
            dispatch(logout());
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          dispatch(logout());
        }
      }
      setCheckingAuth(false);
    };

    verifySession();
  }, [token, dispatch]);

  if (token && checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold">Verifying secure session...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected System Pages */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard selectedBranch={selectedBranch} />} />
                  <Route path="/pos" element={<BillingPOS selectedBranch={selectedBranch} />} />
                  <Route path="/inventory" element={<Inventory selectedBranch={selectedBranch} />} />
                  <Route path="/products" element={<Products selectedBranch={selectedBranch} />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/orders" element={<Orders selectedBranch={selectedBranch} />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/employees" element={<Employees selectedBranch={selectedBranch} />} />
                  <Route path="/reports" element={<Reports selectedBranch={selectedBranch} />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
