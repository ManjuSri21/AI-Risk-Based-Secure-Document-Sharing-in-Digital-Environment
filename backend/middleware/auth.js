import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User session invalid. Account not found.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Access revoked. Account has been suspended.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.status !== 'Suspended') {
        req.user = user;
      }
    }
  } catch {
    // Ignore error in optional auth
  }
  next();
};
