import Employee from '../models/Employee.js';
import ActivityLog from '../models/ActivityLog.js';

export const getEmployees = async (req, res) => {
  try {
    const { branchId } = req.query;
    let query = {};
    if (branchId) query.branchId = branchId;
    
    const employees = await Employee.find(query);
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, phone, role, branchId, salary } = req.body;
    const employee = await Employee.create({ name, phone, role, branchId, salary, attendance: [] });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Create Employee',
      details: `Created employee record for ${name} (${role})`,
      ipAddress: req.ip || 'local'
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (req.user.role !== 'Super Admin' && employee.branchId && employee.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this employee' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true });

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Update Employee',
      details: `Updated employee record for ${updatedEmployee.name}`,
      ipAddress: req.ip || 'local'
    });

    res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (req.user.role !== 'Super Admin' && employee.branchId && employee.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this employee' });
    }

    await Employee.findByIdAndDelete(id);

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action: 'Delete Employee',
      details: `Deleted employee record for ${employee.name}`,
      ipAddress: req.ip || 'local'
    });

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status } = req.body; // status: Present, Absent, Late, Leave

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (req.user.role !== 'Super Admin' && employee.branchId && employee.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to record attendance for this employee' });
    }

    // Check if attendance already logged for the date
    const attendanceIndex = employee.attendance.findIndex(a => a.date === date);
    let updatedAttendance = [...employee.attendance];

    if (attendanceIndex !== -1) {
      updatedAttendance[attendanceIndex].status = status;
    } else {
      updatedAttendance.push({ date, status });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, { attendance: updatedAttendance }, { new: true });

    res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
