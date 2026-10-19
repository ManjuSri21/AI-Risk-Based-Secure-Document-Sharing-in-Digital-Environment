import express from 'express';
import {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  viewDocumentFile,
  deleteDocument,
  updatePolicy,
} from '../controllers/documentController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(verifyToken); // All document routes require authentication

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getMyDocuments);
router.get('/:id/view', viewDocumentFile);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);
router.put('/:id/policy', updatePolicy);

export default router;
