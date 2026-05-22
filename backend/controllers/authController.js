import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sweetflow_secret_key_2026_jwt', {
    expiresIn: '30d'
  });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, branchId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    if (role === 'Sweet Owner' && branchId) {
      const existingOwner = await User.findOne({ role: 'Sweet Owner', branchId });
      if (existingOwner) {
        return res.status(400).json({ success: false, message: 'This branch is already assigned to another owner' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'Cashier',
      branchId: branchId || null
    });

    // Write audit log
    await ActivityLog.create({
      userId: user._id,
      userName: user.username,
      action: 'Register',
      details: `Registered as ${user.role}`,
      ipAddress: req.ip || 'local'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Write audit log
    await ActivityLog.create({
      userId: user._id,
      userName: user.username,
      action: 'Login',
      details: `Logged in successfully`,
      ipAddress: req.ip || 'local'
    });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          branchId: user.branchId
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({});
    // Sort in reverse order (newest first)
    const sortedLogs = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ success: true, data: sortedLogs.slice(0, 50) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // Remove password before returning
    const usersWithoutPasswords = users.map(u => {
      const userObj = JSON.parse(JSON.stringify(u));
      delete userObj.password;
      return userObj;
    });
    res.status(200).json({ success: true, data: usersWithoutPasswords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, branchId } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    if (role === 'Sweet Owner' && branchId) {
      const existingOwner = await User.findOne({ role: 'Sweet Owner', branchId });
      if (existingOwner) {
        return res.status(400).json({ success: false, message: 'This branch is already assigned to another owner' });
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      branchId: branchId || null
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        branchId: user.branchId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, password, role, branchId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check email conflicts
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another user' });
      }
    }

    const targetRole = role || user.role;
    const targetBranchId = branchId !== undefined ? (branchId || null) : user.branchId;

    if (targetRole === 'Sweet Owner' && targetBranchId) {
      const existingOwner = await User.findOne({ role: 'Sweet Owner', branchId: targetBranchId });
      if (existingOwner) {
        const existingOwnerId = existingOwner._id ? existingOwner._id.toString() : existingOwner.id;
        if (existingOwnerId !== req.params.id) {
          return res.status(400).json({ success: false, message: 'This branch is already assigned to another owner' });
        }
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    updateData.branchId = branchId || null;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        branchId: updatedUser.branchId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
