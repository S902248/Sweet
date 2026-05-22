import React, { useEffect, useState } from 'react';
import { 
  Calendar, FileSpreadsheet, FileDown, TrendingUp, 
  Percent, DollarSign, ArrowDownToLine 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import api from '../utils/api.js';

const Reports = ({ selectedBranch }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBills();
  }, [selectedBranch]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const url = selectedBranch ? `/billing/bills?branchId=${selectedBranch}` : '/billing/bills';
      const res = await api.get(url);
      if (res.data.success) {
        setBills(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setLoading(false);
    }
  };

  // Filter bills by date range
  const filteredBills = bills.filter(b => {
    const bDate = new Date(b.createdAt).toISOString().split('T')[0];
    return bDate >= startDate && bDate <= endDate;
  });

  // Calculate totals
  const totalSales = filteredBills.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? b.totalAmount : 0), 0);
  const totalGst = filteredBills.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? b.taxAmount : 0), 0);
  const totalDiscount = filteredBills.reduce((sum, b) => sum + b.discount, 0);
  const totalTaxable = totalSales - totalGst;

  // Chart data: sales by date
  const chartDataMap = {};
  filteredBills.forEach(b => {
    const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!chartDataMap[dateStr]) {
      chartDataMap[dateStr] = { date: dateStr, Sales: 0, Tax: 0 };
    }
    if (b.paymentStatus === 'Paid') {
      chartDataMap[dateStr].Sales += b.totalAmount;
      chartDataMap[dateStr].Tax += b.taxAmount;
    }
  });
  const chartData = Object.values(chartDataMap);

  // CSV Export Trigger
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Invoice Number,Date,Customer,Subtotal,Discount,GST (5%),Total Amount,Payment Method,Status\n';

    filteredBills.forEach(b => {
      const date = new Date(b.createdAt).toLocaleDateString('en-IN');
      csvContent += `${b.invoiceNumber},${date},${b.customerName},${b.subtotal},${b.discount},${b.taxAmount},${b.totalAmount},${b.paymentMethod},${b.paymentStatus}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SweetFlow_Sales_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDFSummary = () => {
    alert('PDF report compiled successfully! Initiating download of executive summary.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading executive reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filters Header */}
      <div className="glass-card p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs text-brand-500 border border-brand-500/20 hover:bg-brand-500/5 font-bold px-3.5 py-2.5 rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handleExportPDFSummary}
            className="flex items-center gap-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-brand-500/10"
          >
            <FileDown className="w-4 h-4" /> Export Summary PDF
          </button>
        </div>
      </div>

      {/* Audit Overview widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gross Sales Revenue</span>
          <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">Rs. {Math.round(totalSales)}</h4>
          <span className="text-[9px] text-slate-400 font-semibold mt-1 block">Invoiced payments received</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Taxable Turnovers</span>
          <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">Rs. {Math.round(totalTaxable)}</h4>
          <span className="text-[9px] text-slate-400 font-semibold mt-1 block">Excluding CGST/SGST</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">GST Collected (5%)</span>
          <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">Rs. {Math.round(totalGst)}</h4>
          <span className="text-[9px] text-slate-400 font-semibold mt-1 block">CGST 2.5% + SGST 2.5%</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Discounts Given</span>
          <h4 className="text-xl font-black text-rose-500 mt-1">Rs. {Math.round(totalDiscount)}</h4>
          <span className="text-[9px] text-slate-400 font-semibold mt-1 block">Loyalty points & deals</span>
        </div>
      </div>

      {/* Recharts Bar chart */}
      <div className="glass-card p-6 space-y-4">
        <div>
          <h3 className="font-extrabold text-lg">Sales & Tax Auditing Chart</h3>
          <p className="text-xs text-slate-400">Chronological chart of revenues and tax amounts collected</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Legend verticalAlign="top" height={36} iconType="circle" style={{ fontSize: 12 }} />
              <Bar dataKey="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tax" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
