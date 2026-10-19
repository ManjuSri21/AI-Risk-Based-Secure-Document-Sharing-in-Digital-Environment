import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  getAdminDocuments,
  getAdminRiskTelemetry,
  labelDocumentRisk,
  exportRiskTrainingData,
  getDocumentAuditLogs,
  investigateDocumentContent,
} from '../controllers/adminController.js';
import {
  activateAdminKey,
  getAdminSecurityState,
  revokeAdminKey,
  rotateAdminKey,
  updateAdminSecuritySettings,
} from '../controllers/adminSecurityController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/documents', getAdminDocuments);
router.get('/risk-training-data', exportRiskTrainingData);
router.patch('/documents/:id/risk-label', labelDocumentRisk);
router.get('/documents/:id/audit-logs', getDocumentAuditLogs);
router.post('/documents/:id/investigate', investigateDocumentContent);
router.get('/risk-telemetry', getAdminRiskTelemetry);
router.post('/security/key/rotate', rotateAdminKey);
router.post('/security/key/:id/activate', activateAdminKey);
router.post('/security/key/:id/revoke', revokeAdminKey);
router.get('/security', getAdminSecurityState);
router.patch('/security/settings', updateAdminSecuritySettings);

export default router;
