import express from 'express';
import { getMyAuditLogs, getAdminAuditLogs, clearAllAuditLogs } from '../controllers/auditController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/my-logs', getMyAuditLogs);
router.get('/admin-logs', requireAdmin, getAdminAuditLogs);
router.delete('/clear-all', requireAdmin, clearAllAuditLogs);

export default router;
