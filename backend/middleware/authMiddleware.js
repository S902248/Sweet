import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sweetflow_secret_key_2026_jwt');

      // Fetch user from DB/Mock DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        branchId: user.branchId
      };

      next();
    } catch (error) {
      console.error('Auth check error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role (${req.user ? req.user.role : 'None'}) is not authorized to access this resource` 
      });
    }
    next();
  };
};

export const enforceBranchScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized, no user found' });
  }

  // Super Admin can access any branch
  if (req.user.role === 'Super Admin') {
    return next();
  }

  const userBranchId = req.user.branchId ? req.user.branchId.toString() : null;
  if (!userBranchId) {
    return res.status(400).json({ success: false, message: 'User is not assigned to any branch/store' });
  }

  // Overrides to force data fetching/creation for their own branch
  req.query.branchId = userBranchId;
  if (req.body) {
    req.body.branchId = userBranchId;
  }

  next();
};

