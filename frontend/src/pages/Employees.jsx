import React, { useEffect, useState } from 'react';
import { Users, ClipboardCheck, DollarSign, Star, Plus, Check, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import { validateName, validatePhone, validateSalary } from '../utils/validators.js';

const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-rose-500">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  ) : null;

const inputClass = (err) =>
  `w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border ${
    err
      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
  } rounded-xl focus:outline-none text-xs text-slate-700 dark:text-slate-200`;

const Employees = ({ selectedBranch }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Employee Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Cashier');
  const [salary, setSalary] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Daily attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchEmployees();
  }, [selectedBranch]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const url = selectedBranch ? `/employees?branchId=${selectedBranch}` : '/employees';
      const res = await api.get(url);
      if (res.data.success) {
        setEmployees(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setLoading(false);
    }
  };

  const validate = (fields = { name, phone, salary }) => {
    return {
      name: validateName(fields.name, 'Full Name'),
      phone: validatePhone(fields.phone),
      salary: validateSalary(fields.salary),
    };
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    // Touch all fields
    setTouched({ name: true, phone: true, salary: true });
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    try {
      const res = await api.post('/employees', {
        name,
        phone,
        role,
        salary: Number(salary),
        branchId: selectedBranch || 'mock_branch_1'
      });
      if (res.data.success) {
        setEmployees([...employees, res.data.data]);
        setShowModal(false);
        // Reset form
        setName('');
        setPhone('');
        setRole('Cashier');
        setSalary('');
        setErrors({});
        setTouched({});
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding employee');
    }
  };

  const handleAttendanceChange = async (empId, status) => {
    try {
      const res = await api.post(`/employees/attendance/${empId}`, {
        date: attendanceDate,
        status
      });
      if (res.data.success) {
        setEmployees(employees.map(e => (e._id === empId || e.id === empId) ? res.data.data : e));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading staff directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendance date control & add button */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:max-w-xs">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide shrink-0">Attendance Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
          />
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-xs text-white bg-brand-500 hover:bg-brand-600 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4.5 h-4.5" /> Add Staff Member
        </button>
      </div>

      {/* Employees Table */}
      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Monthly Salary</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Daily Attendance ({attendanceDate})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {employees.map(emp => {
                const todayAttendance = emp.attendance?.find(a => a.date === attendanceDate)?.status || 'Absent';
                return (
                  <tr key={emp._id || emp.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{emp.name}</p>
                      <span className="text-[10px] text-slate-400">{emp.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-800 dark:text-white">
                      Rs. {emp.salary}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < (emp.performanceScore || 5) ? 'fill-current' : 'opacity-20'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1.5">
                        {['Present', 'Late', 'Absent'].map(status => {
                          const isSelected = todayAttendance === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleAttendanceChange(emp._id || emp.id, status)}
                              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                                isSelected
                                  ? status === 'Present'
                                    ? 'bg-emerald-500 text-white'
                                    : status === 'Late'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-rose-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card glass-modal p-6 max-w-md w-full space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Add Staff Member</h3>
              <p className="text-xs text-slate-400 mt-1">Configure employee profile, role, and salary parameters</p>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (touched.name) setErrors(v => ({ ...v, name: validateName(e.target.value, 'Full Name') })); }}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Ramesh Sen"
                  className={inputClass(touched.name && errors.name)}
                />
                <FieldError msg={touched.name && errors.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (touched.phone) setErrors(v => ({ ...v, phone: validatePhone(e.target.value) })); }}
                    onBlur={() => handleBlur('phone')}
                    placeholder="e.g. 9830098300"
                    maxLength={13}
                    className={inputClass(touched.phone && errors.phone)}
                  />
                  <FieldError msg={touched.phone && errors.phone} />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Monthly Salary (Rs.)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => { setSalary(e.target.value); if (touched.salary) setErrors(v => ({ ...v, salary: validateSalary(e.target.value) })); }}
                    onBlur={() => handleBlur('salary')}
                    placeholder="e.g. 25000"
                    min="1"
                    className={inputClass(touched.salary && errors.salary)}
                  />
                  <FieldError msg={touched.salary && errors.salary} />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="Admin">Admin</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Inventory Staff">Inventory Staff</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErrors({}); setTouched({}); }}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
