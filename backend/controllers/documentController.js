import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import Share from '../models/Share.js';
import { analyzeDocumentRisk } from '../services/riskAssessmentService.js';
import { generateAdaptivePolicy } from '../services/policyService.js';
import { logAuditEvent } from '../services/auditLogger.js';

const isDocumentRestricted = (document) =>
  document.status === 'Suspended' ||
  document.status === 'Rejected' ||
  document.documentStatus === 'SUSPENDED' ||
  document.documentStatus === 'REJECTED';

const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded' });
    }

    const { originalname, path: filePath, size } = req.file;
    const docName = req.body.docName || originalname;
    const ext = path.extname(originalname).replace('.', '').toUpperCase() || 'PDF';

    // OCR & text extraction, sensitive information detection, and trained Decision Tree risk prediction.
    const assessment = await analyzeDocumentRisk(filePath, originalname, docName);
    const {
      documentType,
      predictedRisk,
      finalRisk,
      riskLevel,
      riskScore,
      aiConfidence,
      modelVersion,
      policyReason,
      riskFeatures,
      riskAssessmentMethod,
      detectedEntities,
      sensitiveInfo,
      extractedSummary,
    } = assessment;

    const policy = generateAdaptivePolicy(finalRisk);

    const document = await Document.create({
      name: docName,
      originalName: originalname,
      filePath,
      fileType: ext,
      fileSize: size,
      sizeFormatted: formatBytes(size),
      owner: req.user._id,
      ownerName: req.user.name,
      documentStatus: 'ACTIVE',
      status: 'Protected',
      documentType,
      predictedRisk,
      finalRisk,
      riskLevel,
      riskScore,
      aiConfidence,
      modelVersion,
      policyReason,
      riskFeatures,
      riskAssessmentMethod,
      sensitiveInfo,
      extractedSummary,
      policy,
    });

    await logAuditEvent({
      req,
      user: req.user,
      document,
      action: 'Uploaded',
      result: 'Success',
      details: `Document uploaded: ${docName} (${formatBytes(size)})`,
    });

    await logAuditEvent({
      req,
      user: req.user,
      document,
      action: 'Risk Assessed',
      result: 'Success',
      details: `Classified as ${finalRisk} Risk (Predicted: ${predictedRisk}, Score: ${riskScore}, Method: ${riskAssessmentMethod}, Reason: ${policyReason})`,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed. Document authenticity is not checked.',
      document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Document upload or analysis failed', error: error.message });
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const { search, risk, type } = req.query;
    const query = { owner: req.user._id };

    if (risk && risk !== 'ALL') {
      query.riskLevel = risk;
    }
    if (type && type !== 'ALL') {
      query.fileType = type;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Access control: only owner or admin can view
    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to access this document' });
    }

    res.status(200).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve document', error: error.message });
  }
};

export const viewDocumentFile = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this document' });
    }

    if (isDocumentRestricted(document)) {
      return res.status(403).json({ success: false, message: 'This document is not available because it has been suspended or rejected.' });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ success: false, message: 'The stored document file could not be found' });
    }

    const contentTypes = {
      PDF: 'application/pdf',
      TXT: 'text/plain; charset=utf-8',
      JPG: 'image/jpeg',
      JPEG: 'image/jpeg',
      PNG: 'image/png',
      DOC: 'application/msword',
      DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const contentType = contentTypes[document.fileType] || 'application/octet-stream';

    await logAuditEvent({
      req,
      user: req.user,
      document,
      action: 'Viewed',
      result: 'Success',
      details: `Document viewed by owner: ${document.name}`,
    });

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    });
    res.sendFile(document.filePath, (error) => {
      if (error && !res.headersSent) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: 'Failed to send document file',
        });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to view document', error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this document' });
    }

    // Clean up physical file if present
    if (fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        console.warn('Could not remove file on disk:', err.message);
      }
    }
    if (document.quarantinePath && fs.existsSync(document.quarantinePath) && document.quarantinePath !== document.filePath) {
      try {
        fs.unlinkSync(document.quarantinePath);
      } catch (err) {
        console.warn('Could not remove quarantine file on disk:', err.message);
      }
    }

    // Remove associated shares
    await Share.deleteMany({ document: document._id });
    await Document.findByIdAndDelete(document._id);

    await logAuditEvent({
      req,
      user: req.user,
      documentName: document.name,
      action: 'Deleted',
      result: 'Success',
      details: `Document deleted: ${document.name}`,
    });

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
};

export const updatePolicy = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify policy' });
    }

    if (isDocumentRestricted(document)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update policy for a suspended or rejected document.',
      });
    }

    document.policy = { ...document.policy, ...req.body.policy };
    await document.save();

    await logAuditEvent({
      req,
      user: req.user,
      document,
      action: 'Policy Applied',
      result: 'Success',
      details: `Updated security policy for ${document.name}`,
    });

    res.status(200).json({ success: true, message: 'Policy updated successfully', document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update policy', error: error.message });
  }
};

