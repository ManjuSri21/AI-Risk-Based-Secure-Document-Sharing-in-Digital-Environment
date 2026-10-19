import User from '../models/User.js';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';
import Share from '../models/Share.js';
import { logAuditEvent } from '../services/auditLogger.js';
import { RISK_FEATURE_NAMES } from '../services/riskAssessmentService.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const documentsAnalyzed = await Document.countDocuments();
    const highRiskDocuments = await Document.countDocuments({ riskLevel: 'HIGH' });
    const blockedAccessAttempts = await AuditLog.countDocuments({ result: 'Blocked' });

    // Real-time recent security alerts from AuditLog (last 24 hours)
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const alertLogs = await AuditLog.find({
      createdAt: { $gte: since24h },
      $or: [
        { result: 'Blocked' },
        { action: 'User Suspended' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const alerts = alertLogs.map((log) => ({
      id: log._id,
      title: log.action,
      desc: log.details || `${log.action} for ${log.documentName || 'resource'}`,
      severity: log.result === 'Blocked' ? 'high' : 'medium',
      time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        documentsAnalyzed,
        highRiskDocuments,
        blockedAccessAttempts,
      },
      alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats', error: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    // Aggregate document count per user
    const usersWithDocCounts = await Promise.all(
      users.map(async (u) => {
        const docs = await Document.countDocuments({ owner: u._id });
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role === 'admin' ? 'System Administrator' : 'Document Owner',
          status: u.status,
          docs,
          joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
      })
    );

    res.status(200).json({ success: true, count: usersWithDocCounts.length, users: usersWithDocCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users', error: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend master administrator accounts' });
    }

    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    await user.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: user.status === 'Suspended' ? 'User Suspended' : 'User Activated',
      result: 'Success',
      details: `Administrator ${req.user.name} changed status of ${user.email} to ${user.status}`,
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
  }
};

export const getAdminDocuments = async (req, res) => {
  try {
    const { search, risk, status } = req.query;
    const query = {};

    if (risk && risk !== 'ALL') query.riskLevel = risk;
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });

    const formattedDocs = await Promise.all(
      documents.map(async (d) => {
        // Query associated shares for sharing status and expiry time
        const shares = await Share.find({ document: d._id });
        const activeShares = shares.filter((s) => s.status === 'Active' && new Date(s.expiresAt) > new Date());

        let sharingStatus = 'Protected';
        let expiryTime = d.policy?.accessDuration ? `Policy: ${d.policy.accessDuration}` : '24 Hours';

        if (activeShares.length > 0) {
          sharingStatus = `Shared (${activeShares.length} active)`;
          const latestExpiry = activeShares.sort((a, b) => new Date(b.expiresAt) - new Date(a.expiresAt))[0].expiresAt;
          expiryTime = new Date(latestExpiry).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } else if (shares.length > 0) {
          sharingStatus = 'Share Expired';
        } else if (d.status === 'Suspended' || d.status === 'Rejected') {
          sharingStatus = 'Access Restricted';
          expiryTime = 'Access Blocked';
        }

        return {
          id: d._id,
          name: d.name,
          originalName: d.originalName,
          owner: d.ownerName,
          ownerId: d.owner,
          uploadDate: new Date(d.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          uploadDateTime: new Date(d.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          createdAt: d.createdAt,
          riskLevel: d.riskLevel,
          riskScore: d.riskScore,
          aiConfidence: d.aiConfidence,
          riskAssessmentMethod: d.riskAssessmentMethod || 'RULES',
          reviewedRiskLevel: d.reviewedRiskLevel || '',
          canLabelRisk: RISK_FEATURE_NAMES.every((name) =>
            Number.isFinite(d.riskFeatures?.[name])
          ),
          sharingStatus,
          expiryTime,
          status: d.status,
          policy: d.policy?.authentication ? `${d.policy.encryption} + ${d.policy.authentication}` : 'Standard',
          size: d.sizeFormatted,
          lastActivity: new Date(d.updatedAt).toLocaleDateString(),
        };
      })
    );

    res.status(200).json({ success: true, count: formattedDocs.length, documents: formattedDocs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin documents', error: error.message });
  }
};

export const labelDocumentRisk = async (req, res) => {
  try {
    const { riskLevel } = req.body;
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(riskLevel)) {
      return res.status(400).json({ success: false, message: 'Risk label must be LOW, MEDIUM, or HIGH.' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    if (!document.riskFeatures || !RISK_FEATURE_NAMES.every((name) =>
      Number.isFinite(document.riskFeatures[name])
    )) {
      return res.status(409).json({
        success: false,
        message: 'This document predates risk feature collection and cannot be used as a training example.',
      });
    }

    document.reviewedRiskLevel = riskLevel;
    document.riskReviewedBy = req.user._id;
    document.riskReviewedAt = new Date();
    await document.save();

    await logAuditEvent({
      req,
      user: req.user,
      document,
      action: 'Risk Label Reviewed',
      result: 'Success',
      details: `Administrator reviewed the document risk label as ${riskLevel}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Human-reviewed risk label saved for the training dataset.',
      reviewedRiskLevel: document.reviewedRiskLevel,
      riskReviewedAt: document.riskReviewedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save reviewed risk label', error: error.message });
  }
};

export const exportRiskTrainingData = async (req, res) => {
  try {
    const documents = await Document.find({
      reviewedRiskLevel: { $in: ['LOW', 'MEDIUM', 'HIGH'] },
    }).select('riskFeatures reviewedRiskLevel');
    const trainableDocuments = documents.filter((document) =>
      RISK_FEATURE_NAMES.every((name) => Number.isFinite(document.riskFeatures?.[name]))
    );

    const csv = [
      [...RISK_FEATURE_NAMES, 'riskLevel'].join(','),
      ...trainableDocuments.map((document) => [
        ...RISK_FEATURE_NAMES.map((name) => Number(document.riskFeatures?.[name])),
        document.reviewedRiskLevel,
      ].join(',')),
    ].join('\r\n');

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="risk-training-data.csv"',
      'Cache-Control': 'no-store',
    });
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export reviewed risk labels', error: error.message });
  }
};

export const getDocumentAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const logs = await AuditLog.find({
      $or: [
        { document: id },
        { documentName: document.name },
        { documentName: document.originalName },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      document: {
        id: document._id,
        name: document.name,
        owner: document.ownerName,
        riskLevel: document.riskLevel,
      },
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve document audit logs', error: error.message });
  }
};

export const investigateDocumentContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { justification } = req.body;

    if (!justification || justification.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A formal security justification (minimum 5 characters) is required to unlock document contents for investigation.',
      });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Record immutable forensic audit log for this authorized security access
    await logAuditEvent({
      req,
      user: req.user,
      document,
      action: 'Restricted Investigation Access',
      result: 'Success',
      details: `Administrator ${req.user.name} accessed shielded document '${document.name}' for security investigation. Justification: "${justification.trim()}". Content unsealed for inspection.`,
    });

    res.status(200).json({
      success: true,
      message: 'Authorized investigation access granted. Forensic audit log recorded.',
      investigation: {
        documentId: document._id,
        name: document.name,
        originalName: document.originalName,
        owner: document.ownerName,
        fileType: document.fileType,
        size: document.sizeFormatted,
        riskLevel: document.riskLevel,
        riskScore: document.riskScore,
        aiConfidence: document.aiConfidence,
        sensitiveInfo: document.sensitiveInfo || [],
        extractedSummary: document.extractedSummary || 'Content analyzed by OCR/AI and shielded under privacy policy.',
        policy: document.policy,
        investigatedBy: req.user.name,
        investigationTimestamp: new Date().toISOString(),
        justification: justification.trim(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to authorize investigation access', error: error.message });
  }
};

export const getAdminRiskTelemetry = async (req, res) => {
  try {
    const low = await Document.countDocuments({ riskLevel: 'LOW' });
    const medium = await Document.countDocuments({ riskLevel: 'MEDIUM' });
    const high = await Document.countDocuments({ riskLevel: 'HIGH' });
    const total = await Document.countDocuments();

    const totalShares = await Share.countDocuments();
    const verifiedOtpCount = await AuditLog.countDocuments({ action: 'OTP Verified' });
    const blockedCount = await AuditLog.countDocuments({ result: 'Blocked' });
    // Real dynamic activity for the last 7 days
    const now = new Date();
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dynamicLabels = [];
    const sharesCreatedByDay = [0, 0, 0, 0, 0, 0, 0];
    const otpVerifiedByDay = [0, 0, 0, 0, 0, 0, 0];
    const blockedByDay = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const idx = 6 - i;
      dynamicLabels.push(dayLabels[start.getDay()]);

      sharesCreatedByDay[idx] = await Share.countDocuments({
        createdAt: { $gte: start, $lt: end },
      });
      otpVerifiedByDay[idx] = await AuditLog.countDocuments({
        action: 'OTP Verified',
        createdAt: { $gte: start, $lt: end },
      });
      blockedByDay[idx] = await AuditLog.countDocuments({
        result: 'Blocked',
        createdAt: { $gte: start, $lt: end },
      });
    }

    const highPercent = total > 0 ? Number(((high / total) * 100).toFixed(1)) : 0;
    const medPercent = total > 0 ? Number(((medium / total) * 100).toFixed(1)) : 0;
    const lowPercent = total > 0 ? Number(((low / total) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      telemetry: {
        total,
        distribution: {
          low,
          medium,
          high,
        },
        breakdown: [
          { level: 'HIGH', count: high, color: 'rose', percent: highPercent },
          { level: 'MEDIUM', count: medium, color: 'amber', percent: medPercent },
          { level: 'LOW', count: low, color: 'emerald', percent: lowPercent },
        ],
        activityMetrics: {
          sharesCreated: totalShares,
          otpVerified: verifiedOtpCount,
          blockedRequests: blockedCount,
        },
        chartData: {
          labels: dynamicLabels,
          sharesCreated: sharesCreatedByDay,
          otpVerified: otpVerifiedByDay,
          blockedRequests: blockedByDay,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve risk telemetry', error: error.message });
  }
};
