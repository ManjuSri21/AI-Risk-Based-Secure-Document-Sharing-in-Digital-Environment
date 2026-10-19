import express from 'express';
import {
  createShare,
  getShareInfo,
  verifyPassword,
  requestShareOtp,
  verifyOtp,
  viewDocumentContent,
  downloadDocumentFile,
  requireShareAccess,
  getMyShares,
} from '../controllers/shareController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Authenticated user generates share
router.post('/create', verifyToken, createShare);

// Get all shares created by logged-in user
router.get('/my-shares', verifyToken, getMyShares);

// Public / Recipient Access Endpoints
router.get('/:shareToken/info', getShareInfo);
router.post('/:shareToken/verify-password', verifyPassword);
router.post('/:shareToken/request-otp', requestShareOtp);
router.post('/:shareToken/verify-otp', verifyOtp);
router.get('/:shareToken/view', requireShareAccess, viewDocumentContent);
router.get('/:shareToken/download', requireShareAccess, downloadDocumentFile);

export default router;
