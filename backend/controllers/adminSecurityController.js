import mongoose from 'mongoose';
import AdminSecurity from '../models/AdminSecurity.js';
import AdminSecuritySettings from '../models/AdminSecuritySettings.js';
import { createEncryptedKeyRecord } from '../services/adminKeyService.js';
import { logAuditEvent } from '../services/auditLogger.js';

const keyMetadata = (record) => ({
  id: record._id,
  keyId: record.keyId,
  algorithm: record.algorithm,
  rotatedAt: record.rotatedAt,
  activatedAt: record.activatedAt,
  active: record.active,
  revokedAt: record.revokedAt,
  reason: record.reason,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
});

export const getAdminSecurityState = async (req, res) => {
  try {
    const [activeKey, keyHistory, settings] = await Promise.all([
      AdminSecurity.findOne({ active: true }).lean(),
      AdminSecurity.find().sort({ createdAt: -1 }).limit(20).lean(),
      AdminSecuritySettings.findOneAndUpdate(
        { key: 'global' },
        { $setOnInsert: { key: 'global' } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean(),
    ]);

    res.status(200).json({
      success: true,
      activeKey: activeKey ? keyMetadata(activeKey) : null,
      keyHistory: keyHistory.map(keyMetadata),
      settings: {
        hardwareMfa: settings.hardwareMfa,
        socAlerts: settings.socAlerts,
        immutableAudit: settings.immutableAudit,
        sessionTimeout: settings.sessionTimeout,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrator security state',
      error: error.message,
    });
  }
};

export const updateAdminSecuritySettings = async (req, res) => {
  const allowedSettings = ['hardwareMfa', 'socAlerts', 'immutableAudit', 'sessionTimeout'];
  const updates = {};

  for (const setting of allowedSettings) {
    if (Object.prototype.hasOwnProperty.call(req.body, setting)) {
      if (typeof req.body[setting] !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: `${setting} must be a boolean.`,
        });
      }
      updates[setting] = req.body[setting];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one supported administrator security setting.',
    });
  }

  try {
    const settings = await AdminSecuritySettings.findOneAndUpdate(
      { key: 'global' },
      { $set: { ...updates, updatedBy: req.user._id }, $setOnInsert: { key: 'global' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    for (const [setting, enabled] of Object.entries(updates)) {
      await logAuditEvent({
        req,
        user: req.user,
        action: 'Admin Security Setting Updated',
        result: 'Success',
        details: `${setting} was ${enabled ? 'enabled' : 'disabled'}.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Administrator security settings updated',
      settings: {
        hardwareMfa: settings.hardwareMfa,
        socAlerts: settings.socAlerts,
        immutableAudit: settings.immutableAudit,
        sessionTimeout: settings.sessionTimeout,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update administrator security settings',
      error: error.message,
    });
  }
};

export const rotateAdminKey = async (req, res) => {
  let previousActiveKey = null;
  let newKey = null;
  try {
    const reason = typeof req.body.reason === 'string' && req.body.reason.trim()
      ? req.body.reason.trim().slice(0, 200)
      : 'Routine rotation';

    const newKeyData = createEncryptedKeyRecord(req.user._id, reason);
    newKey = await AdminSecurity.create({ ...newKeyData, active: false });

    previousActiveKey = await AdminSecurity.findOne({ active: true });
    await AdminSecurity.updateMany({ active: true }, { $set: { active: false } });
    newKey.active = true;
    newKey.activatedAt = new Date();
    await newKey.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'Master Encryption Key Rotated',
      result: 'Success',
      details: `Admin rotated the master AES-256 key. New key ID: ${newKey.keyId}. Reason: ${reason}`,
    });

    res.status(200).json({
      success: true,
      message: 'Master AES-256 key rotated successfully',
      activeKey: keyMetadata(newKey),
    });
  } catch (error) {
    if (previousActiveKey) {
      await AdminSecurity.updateOne(
        { _id: previousActiveKey._id, revokedAt: null },
        { $set: { active: true } }
      ).catch((rollbackError) => {
        console.error('[Admin Key Rotation Rollback Failed]', rollbackError.message);
      });
    }
    await logAuditEvent({
      req,
      user: req.user,
      action: 'Master Encryption Key Rotation Failed',
      result: 'Blocked',
      details: `Master key rotation failed: ${error.message}`,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to rotate master encryption key',
      error: error.message,
    });
  }
};

export const activateAdminKey = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid key identifier.' });
  }

  let previousActiveKey = null;
  try {
    const targetKey = await AdminSecurity.findById(req.params.id);
    if (!targetKey || targetKey.revokedAt) {
      return res.status(404).json({
        success: false,
        message: 'Key not found or it has been revoked and cannot be restored.',
      });
    }

    previousActiveKey = await AdminSecurity.findOne({ active: true });
    await AdminSecurity.updateMany({ active: true }, { $set: { active: false } });
    targetKey.active = true;
    targetKey.activatedAt = new Date();
    await targetKey.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'Master Encryption Key Restored',
      result: 'Success',
      details: `Previous master key ${targetKey.keyId} was restored.`,
    });

    res.status(200).json({
      success: true,
      message: 'Previous master key restored successfully',
      activeKey: keyMetadata(targetKey),
    });
  } catch (error) {
    if (previousActiveKey) {
      await AdminSecurity.updateOne(
        { _id: previousActiveKey._id, revokedAt: null },
        { $set: { active: true } }
      ).catch((rollbackError) => {
        console.error('[Admin Key Restore Rollback Failed]', rollbackError.message);
      });
    }
    await logAuditEvent({
      req,
      user: req.user,
      action: 'Master Encryption Key Restore Failed',
      result: 'Blocked',
      details: `Restoring key ${req.params.id} failed: ${error.message}`,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to restore master key',
      error: error.message,
    });
  }
};

export const revokeAdminKey = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid key identifier.' });
  }

  try {
    const keyRecord = await AdminSecurity.findById(req.params.id);
    if (!keyRecord || keyRecord.revokedAt) {
      return res.status(404).json({
        success: false,
        message: 'Key not found or already revoked.',
      });
    }

    if (keyRecord.active) {
      await logAuditEvent({
        req,
        user: req.user,
        action: 'Master Encryption Key Revocation Blocked',
        result: 'Blocked',
        details: `Revocation of active key ${keyRecord.keyId} was blocked. Activate another key first.`,
      });
      return res.status(409).json({
        success: false,
        message: 'Activate another key before revoking the active key.',
      });
    }

    keyRecord.active = false;
    keyRecord.revokedAt = new Date();
    keyRecord.revokedBy = req.user._id;
    keyRecord.encryptedKeyMaterial = null;
    keyRecord.iv = null;
    keyRecord.authTag = null;
    await keyRecord.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'Master Encryption Key Revoked',
      result: 'Success',
      details: `Master key ${keyRecord.keyId} was revoked.`,
    });

    res.status(200).json({
      success: true,
      message: 'Master key revoked successfully',
      key: keyMetadata(keyRecord),
    });
  } catch (error) {
    await logAuditEvent({
      req,
      user: req.user,
      action: 'Master Encryption Key Revocation Failed',
      result: 'Blocked',
      details: `Revoking key ${req.params.id} failed: ${error.message}`,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to revoke master key',
      error: error.message,
    });
  }
};
