import express from 'express';
import {
  register,
  login,
  verify2FALogin,
  getMe,
  updateProfile,
  updateSecuritySettings,
  getSessions,
  revokeSession,
  changePassword,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FALogin);

router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/security-settings', verifyToken, updateSecuritySettings);
router.get('/sessions', verifyToken, getSessions);
router.delete('/sessions/:sessionId', verifyToken, revokeSession);
router.put('/change-password', verifyToken, changePassword);

export default router;
