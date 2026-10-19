import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import Share from '../models/Share.js';
import Document from '../models/Document.js';
import { logAuditEvent } from '../services/auditLogger.js';
import { isEmailConfigured, sendShareLinkEmail, sendShareOtpEmail } from '../services/emailService.js';

const getEmailDeliveryMessage = (error, emailType) => {
  const message = String(error.smtpMessage || '').toLowerCase();
  const authenticationFailed = error.smtpCode === 'EAUTH'
    || error.smtpResponseCode === 535
    || message.includes('username and password not accepted');

  if (authenticationFailed) {
    return 'Gmail rejected the SMTP login. Check SMTP_USER and SMTP_PASS in backend/.env; SMTP_PASS must be a current Google App Password.';
  }
  if (message.includes('certificate') || message.includes('self-signed')) {
    return 'Secure SMTP connection failed because this computer or network does not trust the mail server certificate. Retry on another network or ask your administrator to configure its trusted CA certificate. Do not disable TLS verification.';
  }
  return `The ${emailType} email could not be sent. Check the backend SMTP settings and server logs, then try again.`;
};

const isDocumentRestricted = (document) =>
  document.status === 'Suspended' ||
  document.status === 'Rejected' ||
  document.documentStatus === 'SUSPENDED' ||
  document.documentStatus === 'REJECTED';

// Calculate expiration date from string
const parseExpiry = (expiryStr) => {
  const now = new Date();
  if (expiryStr === '15 Minutes') return new Date(now.getTime() + 15 * 60 * 1000);
  if (expiryStr === '1 Hour') return new Date(now.getTime() + 60 * 60 * 1000);
  if (expiryStr === '6 Hours') return new Date(now.getTime() + 6 * 60 * 60 * 1000);
  if (expiryStr === '24 Hours' || expiryStr === '1 Day') return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (expiryStr === '7 Days') return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() + 60 * 60 * 1000); // default 1 hour
};

const createShareAccessToken = (share) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  const expiresIn = Math.max(1, Math.floor((share.expiresAt.getTime() - Date.now()) / 1000));
  return jwt.sign(
    { type: 'share-access', shareId: share._id.toString(), shareToken: share.shareToken },
    secret,
    { expiresIn: Math.min(expiresIn, 15 * 60) }
  );
};

const sendOtp = async (share) => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  share.otpCode = otp;
  share.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  if (share.hasPassword) share.passwordVerifiedAt = new Date();
  await share.save();

  try {
    await sendShareOtpEmail({
      to: share.recipientEmail,
      documentName: share.document.name,
      otp,
    });
  } catch (error) {
    share.otpCode = null;
    share.otpExpires = null;
    share.passwordVerifiedAt = null;
    await share.save();
    throw error;
  }
};

export const createShare = async (req, res) => {
  try {
    const { documentId, recipientEmail, accessMethod, password, expiry, downloadPerm, controls } = req.body;

    if (!documentId || typeof recipientEmail !== 'string' || !recipientEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Document ID and recipient email are required' });
    }
    const validDownloadPerms = ['View Only', 'Allow Download', '1 Time Download', '2 Times Download', '3 Times Download', 'Unlimited Download'];
    if (downloadPerm && !validDownloadPerms.includes(downloadPerm)) {
      return res.status(400).json({ success: false, message: 'Download permission must be View Only or Allow Download' });
    }
    if (!/^\S+@\S+\.\S+$/.test(recipientEmail.trim())) {
      return res.status(400).json({ success: false, message: 'A valid recipient email address is required' });
    }

    const method = accessMethod || 'link';
    if (!['link', 'qr', 'email'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid share access method' });
    }
    const requireOtp = controls?.otp ?? true;
    if ((requireOtp || method === 'email') && !isEmailConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Gmail email delivery is not configured. Add SMTP_USER and a Google App Password as SMTP_PASS in backend/.env, then restart the backend.',
      });
    }
    const hasPassword = Boolean((controls?.password ?? true) && password && password.trim());
    if ((controls?.password ?? true) && !hasPassword) {
      return res.status(400).json({ success: false, message: 'Set an access password or disable password protection' });
    }

    const configuredFrontendUrl = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:5173';
    let frontendUrl;
    try {
      const parsedFrontendUrl = new URL(configuredFrontendUrl);
      if (!['http:', 'https:'].includes(parsedFrontendUrl.protocol)) throw new Error('Unsupported URL protocol');
      frontendUrl = configuredFrontendUrl.replace(/\/+$/, '');
    } catch {
      return res.status(500).json({ success: false, message: 'FRONTEND_URL must be a valid HTTP or HTTPS URL for secure share links' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to share this document' });
    }

    if (isDocumentRestricted(document)) {
      return res.status(403).json({
        success: false,
        message: `Cannot share document '${document.name}' because it has been suspended or rejected.`,
      });
    }

    // Generate unique 8-character share token
    const shareToken = crypto.randomBytes(4).toString('hex').toUpperCase();

    let passwordHash = null;
    if (hasPassword) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    const expiresAt = parseExpiry(expiry);

    const normalizedRecipientEmail = recipientEmail.trim().toLowerCase();
    const share = await Share.create({
      document: document._id,
      createdBy: req.user._id,
      shareToken,
      recipientEmail: normalizedRecipientEmail,
      accessMethod: method,
      passwordHash,
      hasPassword,
      requireOtp,
      expiresAt,
      downloadPerm: downloadPerm || 'View Only',
      controls: {
        password: hasPassword,
        otp: controls?.otp ?? true,
        watermark: controls?.watermark ?? true,
        expiry: controls?.expiry ?? true,
        downloadRestriction: downloadPerm === 'View Only',
        audit: controls?.audit ?? true,
      },
    });

    const shareUrl = `${frontendUrl}/shared-access?token=${encodeURIComponent(shareToken)}`;

    if (method === 'email') {
      try {
        await sendShareLinkEmail({
          to: normalizedRecipientEmail,
          documentName: document.name,
          shareUrl,
          expiry: expiresAt,
        });
      } catch (error) {
        console.error('[Share Link Email Error]', error.smtpCode || error.code, error.smtpMessage || error.message);
        await Share.findByIdAndDelete(share._id);
        return res.status(503).json({
          success: false,
          message: error.code === 'EMAIL_NOT_CONFIGURED'
            ? 'Email delivery is not configured. Add SMTP settings and try again.'
            : getEmailDeliveryMessage(error, 'share link'),
        });
      }
    }

    document.status = 'Shared';
    await document.save();

    await logAuditEvent({
      req,
      user: req.user,
      document,
      action: 'Shared',
      result: 'Success',
      details: `Shared with ${recipientEmail} (Token: ${shareToken}, Exp: ${expiry})`,
    });

    res.status(201).json({
      success: true,
      message: 'Secure share created successfully',
      share: {
        id: share._id,
        shareToken,
        shareUrl,
        recipientEmail: share.recipientEmail,
        expiresAt: share.expiresAt,
        requireOtp: share.requireOtp,
        hasPassword: share.hasPassword,
        downloadPerm: share.downloadPerm,
        emailSent: method === 'email',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create share', error: error.message });
  }
};

export const getShareInfo = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const share = await Share.findOne({ shareToken }).populate('document');

    if (!share) {
      return res.status(404).json({ success: false, message: 'Invalid or non-existent share link' });
    }

    if (share.isExpired()) {
      await logAuditEvent({
        req,
        userName: share.recipientEmail,
        document: share.document,
        action: 'Link Expired',
        result: 'Warning',
        details: `Access attempt to expired share link: ${shareToken}`,
      });
      return res.status(410).json({ success: false, message: 'This document share link has expired' });
    }

    res.status(200).json({
      success: true,
      share: {
        shareToken: share.shareToken,
        hasPassword: share.hasPassword,
        requireOtp: share.requireOtp,
        expiresAt: share.expiresAt,
        downloadPerm: share.downloadPerm,
        controls: share.controls,
        document: {
          name: share.document.name,
          riskLevel: share.document.riskLevel,
          riskScore: share.document.riskScore,
          fileType: share.document.fileType,
          sizeFormatted: share.document.sizeFormatted,
          ownerName: share.document.ownerName,
        },
        accessToken: !share.hasPassword && !share.requireOtp ? createShareAccessToken(share) : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve share information', error: error.message });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { password } = req.body;

    const share = await Share.findOne({ shareToken }).select('+passwordHash').populate('document');
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found' });
    }

    if (share.isExpired()) {
      return res.status(410).json({ success: false, message: 'Share link has expired' });
    }

    if (share.hasPassword) {
      if (!password) {
        return res.status(400).json({ success: false, message: 'Access password is required' });
      }
      const isMatch = await bcrypt.compare(password, share.passwordHash);
      if (!isMatch) {
        await logAuditEvent({
          req,
          userName: share.recipientEmail,
          document: share.document,
          action: 'Password Entered',
          result: 'Blocked',
          details: 'Incorrect password entered',
        });
        return res.status(401).json({ success: false, message: 'Incorrect access password' });
      }
    }

    if (share.requireOtp) {
      if (!isEmailConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'OTP email delivery is not configured. Please contact the sender or administrator.',
        });
      }
      try {
        await sendOtp(share);
      } catch (error) {
        console.error('[Share OTP Email Error]', error.smtpCode || error.code, error.smtpMessage || error.message);
        const status = error.code === 'EMAIL_DELIVERY_FAILED' ? 502 : 500;
        return res.status(status).json({
          success: false,
          message: status === 502
            ? getEmailDeliveryMessage(error, 'verification code')
            : 'Failed to prepare the verification code.',
        });
      }
    }

    await logAuditEvent({
      req,
      userName: share.recipientEmail,
      document: share.document,
      action: 'Password Entered',
      result: 'Success',
      details: 'Correct password verified and any required OTP email was sent',
    });

    res.status(200).json({
      success: true,
      message: share.requireOtp
        ? 'Password verified. A one-time code was sent to the recipient email.'
        : 'Password verified successfully',
      requireOtp: share.requireOtp,
      accessToken: share.requireOtp ? null : createShareAccessToken(share),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password verification failed', error: error.message });
  }
};

export const requestShareOtp = async (req, res) => {
  try {
    const share = await Share.findOne({ shareToken: req.params.shareToken })
      .select('+otpCode')
      .populate('document');
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found' });
    }
    if (share.isExpired()) {
      return res.status(410).json({ success: false, message: 'Share link has expired' });
    }
    if (!share.requireOtp || share.hasPassword) {
      return res.status(400).json({ success: false, message: 'OTP cannot be requested for this share at this step' });
    }
    if (!req.body.resend && share.otpCode && share.otpExpires && share.otpExpires > new Date()) {
      return res.status(200).json({ success: true, message: 'A verification code has already been sent to the recipient email.' });
    }
    if (!isEmailConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'OTP email delivery is not configured. Please contact the sender or administrator.',
      });
    }

    await sendOtp(share);
    res.status(200).json({ success: true, message: 'A one-time code was sent to the recipient email.' });
  } catch (error) {
    console.error('[Share OTP Email Error]', error.smtpCode || error.code, error.smtpMessage || error.message);
    const status = error.code === 'EMAIL_DELIVERY_FAILED' ? 502 : 500;
    res.status(status).json({
      success: false,
      message: status === 502
        ? getEmailDeliveryMessage(error, 'verification code')
        : 'Failed to prepare the verification code.',
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { otp } = req.body;
    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'Enter the 6-digit verification code' });
    }

    const share = await Share.findOne({ shareToken }).select('+otpCode').populate('document');
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found' });
    }

    if (share.isExpired()) {
      return res.status(410).json({ success: false, message: 'Share link has expired' });
    }

    if (share.hasPassword && (!share.passwordVerifiedAt || Date.now() - share.passwordVerifiedAt.getTime() > 5 * 60 * 1000)) {
      return res.status(403).json({ success: false, message: 'Verify the share password again before entering the OTP.' });
    }

    if (!share.otpCode || !share.otpExpires || new Date() > share.otpExpires) {
      await logAuditEvent({
        req,
        userName: share.recipientEmail,
        document: share.document,
        action: 'Failed OTP',
        result: 'Blocked',
        details: 'OTP has expired or was not requested',
      });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (share.otpCode !== otp) {
      await logAuditEvent({
        req,
        userName: share.recipientEmail,
        document: share.document,
        action: 'Failed OTP',
        result: 'Blocked',
        details: 'Incorrect OTP entered',
      });
      return res.status(401).json({ success: false, message: 'Invalid OTP code' });
    }

    // OTP verified: clear OTP and record access
    share.otpCode = null;
    share.otpExpires = null;
    share.passwordVerifiedAt = null;
    share.accessCount += 1;
    await share.save();

    await logAuditEvent({
      req,
      userName: share.recipientEmail,
      document: share.document,
      action: 'OTP Verified',
      result: 'Success',
      details: 'Recipient verified via OTP and access granted',
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Access granted.',
      accessToken: createShareAccessToken(share),
      document: {
        id: share.document._id,
        name: share.document.name,
        fileType: share.document.fileType,
        riskLevel: share.document.riskLevel,
        riskScore: share.document.riskScore,
        ownerName: share.document.ownerName,
        downloadPerm: share.downloadPerm,
        controls: share.controls,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
  }
};

export const requireShareAccess = async (req, res, next) => {
  try {
    const share = await Share.findOne({ shareToken: req.params.shareToken }).populate('document');
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found' });
    }
    if (share.isExpired()) {
      return res.status(410).json({ success: false, message: 'Share link has expired' });
    }

    if (share.hasPassword || share.requireOtp) {
      const authorization = req.headers.authorization || '';
      const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
      if (!accessToken) {
        return res.status(401).json({ success: false, message: 'Complete recipient verification before accessing this document' });
      }

      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      if (
        payload.type !== 'share-access' ||
        payload.shareId !== share._id.toString() ||
        payload.shareToken !== share.shareToken
      ) {
        return res.status(403).json({ success: false, message: 'Verification token is not valid for this share' });
      }
    }

    req.share = share;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Recipient verification has expired. Verify access again.' });
    }
    res.status(500).json({ success: false, message: 'Failed to authorize shared document access', error: error.message });
  }
};

export const viewDocumentContent = async (req, res) => {
  try {
    const { share } = req;

    if (isDocumentRestricted(share.document)) {
      return res.status(403).json({
        success: false,
        message: 'Access blocked because this document has been suspended or rejected.',
      });
    }
    if (!fs.existsSync(share.document.filePath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on storage server' });
    }

    await logAuditEvent({
      req,
      userName: share.recipientEmail,
      document: share.document,
      action: 'Viewed',
      result: 'Success',
      details: `Document viewed under adaptive security policy`,
    });

    const contentTypes = {
      PDF: 'application/pdf',
      TXT: 'text/plain; charset=utf-8',
      JPG: 'image/jpeg',
      JPEG: 'image/jpeg',
      PNG: 'image/png',
      DOC: 'application/msword',
      DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    res.set({
      'Content-Type': contentTypes[share.document.fileType] || 'application/octet-stream',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.sendFile(share.document.filePath, (error) => {
      if (error && !res.headersSent) {
        res.status(error.statusCode || 500).json({ success: false, message: 'Failed to send shared document' });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to access document content', error: error.message });
  }
};

export const downloadDocumentFile = async (req, res) => {
  try {
    const { share } = req;
    if (isDocumentRestricted(share.document)) {
      return res.status(403).json({
        success: false,
        message: 'Download blocked because this document has been suspended or rejected.',
      });
    }

    if (share.downloadPerm !== 'Allow Download') {
      await logAuditEvent({
        req,
        userName: share.recipientEmail,
        document: share.document,
        action: 'Unauthorized Download',
        result: 'Blocked',
        details: 'Download blocked due to strict policy restriction',
      });
      return res.status(403).json({ success: false, message: 'Policy Restriction: Download is not enabled for this share.' });
    }

    const filePath = share.document.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on storage server' });
    }

    await logAuditEvent({
      req,
      userName: share.recipientEmail,
      document: share.document,
      action: 'Downloaded',
      result: 'Success',
      details: `Document successfully downloaded by ${share.recipientEmail}`,
    });

    res.download(filePath, share.document.name);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to download document', error: error.message });
  }
};

// GET /shares/my-shares - list all shares created by the logged-in user
export const getMyShares = async (req, res) => {
  try {
    const shares = await Share.find({ createdBy: req.user.userId })
      .populate('document', 'name riskLevel riskScore fileType sizeFormatted createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = shares.map((s) => ({
      id: s._id,
      shareToken: s.shareToken,
      documentName: s.document?.name || 'Unknown',
      documentRisk: s.document?.riskLevel || 'LOW',
      fileType: s.document?.fileType || 'PDF',
      recipientEmail: s.recipientEmail,
      expiresAt: s.expiresAt,
      isExpired: new Date(s.expiresAt) < new Date(),
      accessCount: s.accessCount || 0,
      downloadCount: s.downloadCount || 0,
      controls: s.controls || {},
      createdAt: s.createdAt,
    }));

    res.json({ success: true, shares: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shares', error: error.message });
  }
};
