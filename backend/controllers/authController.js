import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { logAuditEvent } from '../services/auditLogger.js';
import { sendLogin2faEmail, sendLoginNotificationEmail, isEmailConfigured } from '../services/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const parseClientInfo = (req) => {
  const ua = req.headers['user-agent'] || 'Unknown Browser';
  let browser = 'Web Browser';
  let device = 'Desktop PC';

  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  if (/mobile/i.test(ua) || /android/i.test(ua) || /iphone/i.test(ua)) {
    device = 'Mobile Device';
  } else if (/windows/i.test(ua)) {
    device = 'Windows PC';
  } else if (/macintosh|mac os/i.test(ua)) {
    device = 'macOS';
  } else if (/linux/i.test(ua)) {
    device = 'Linux PC';
  }

  const rawIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const ip = String(rawIp).replace('::ffff:', '');

  return { browser, device, ip };
};

const recordSessionAndNotify = async (user, req) => {
  const client = parseClientInfo(req);
  const sessionId = crypto.randomUUID();

  if (!user.sessions) user.sessions = [];
  user.sessions.unshift({
    sessionId,
    device: client.device,
    browser: client.browser,
    ip: client.ip,
    lastActive: new Date(),
    createdAt: new Date(),
  });

  if (user.sessions.length > 8) {
    user.sessions = user.sessions.slice(0, 8);
  }

  await user.save();

  if (user.securitySettings?.loginNotifications) {
    try {
      if (isEmailConfigured()) {
        await sendLoginNotificationEmail({
          to: user.email,
          userName: user.name,
          ip: client.ip,
          device: `${client.device} (${client.browser})`,
          timestamp: new Date(),
        });
      }
      await logAuditEvent({
        req,
        user,
        action: 'Login Notification',
        result: 'Success',
        details: `Login notification sent for ${user.email} from ${client.device} (${client.browser})`,
      });
    } catch (err) {
      console.warn('Failed to dispatch login notification:', err.message);
    }
  }

  return sessionId;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password)' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'user';
    const department = assignedRole === 'admin' ? 'Cybersecurity & Risk Management' : 'Document Owner';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department,
      securitySettings: {
        twoFactor: false,
        loginNotifications: true,
        sessionManagement: true,
      },
    });

    const token = generateToken(user._id);
    await recordSessionAndNotify(user, req);

    await logAuditEvent({
      req,
      user,
      action: 'Account Created',
      result: 'Success',
      details: `New ${assignedRole} account registered: ${user.email}`,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        securitySettings: user.securitySettings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await logAuditEvent({
        req,
        userName: email,
        action: 'Login Attempt',
        result: 'Blocked',
        details: `Failed login attempt for non-existent email: ${email}`,
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'Suspended') {
      await logAuditEvent({
        req,
        user,
        action: 'Login Attempt',
        result: 'Blocked',
        details: `Login blocked for suspended account: ${email}`,
      });
      return res.status(403).json({ success: false, message: 'Account has been suspended. Please contact administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logAuditEvent({
        req,
        user,
        action: 'Login Attempt',
        result: 'Blocked',
        details: `Incorrect password entered for: ${email}`,
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      await logAuditEvent({
        req,
        user,
        action: 'Login Attempt',
        result: 'Blocked',
        details: `Role mismatch: user is registered as '${user.role}' but attempted login as '${role}'`,
      });
      return res.status(403).json({
        success: false,
        message: `Access denied. This account is registered as '${user.role === 'admin' ? 'Admin' : 'User'}'. Please select '${user.role === 'admin' ? 'Admin' : 'User'}' to sign in.`,
      });
    }

    // CHECK IF TWO-FACTOR AUTHENTICATION IS ENABLED
    if (user.securitySettings?.twoFactor) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      user.twoFactorOtp = {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
      await user.save();

      let emailSent = false;
      try {
        if (isEmailConfigured()) {
          await sendLogin2faEmail({ to: user.email, userName: user.name, otp });
          emailSent = true;
        }
      } catch (err) {
        console.warn('Failed to send 2FA login email:', err.message);
      }

      const tempToken = jwt.sign({ id: user._id, type: '2fa-pending' }, process.env.JWT_SECRET, {
        expiresIn: '10m',
      });

      await logAuditEvent({
        req,
        user,
        action: '2FA Challenge',
        result: 'Success',
        details: `Two-factor code generated for ${user.email} (${emailSent ? 'Sent via Email' : 'Development Fallback'})`,
      });

      return res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        email: user.email,
        message: emailSent
          ? `A 6-digit verification code was emailed to ${user.email}.`
          : `2FA active. Use verification code: ${otp}`,
        devOtp: !emailSent ? otp : undefined,
      });
    }

    // NORMAL LOGIN PROCEED
    const token = generateToken(user._id);
    await recordSessionAndNotify(user, req);

    await logAuditEvent({
      req,
      user,
      action: 'Logged In',
      result: 'Success',
      details: `User logged in: ${user.email} (${user.role})`,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        securitySettings: user.securitySettings || { twoFactor: false, loginNotifications: true, sessionManagement: true },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const verify2FALogin = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both token and OTP code' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Verification session expired. Please sign in again.' });
    }

    if (decoded.type !== '2fa-pending') {
      return res.status(400).json({ success: false, message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.twoFactorOtp?.code || new Date(user.twoFactorOtp.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please log in again.' });
    }

    if (user.twoFactorOtp.code !== String(otp).trim()) {
      await logAuditEvent({
        req,
        user,
        action: '2FA Verification',
        result: 'Blocked',
        details: `Incorrect 2FA code entered for ${user.email}`,
      });
      return res.status(400).json({ success: false, message: 'Incorrect 2FA verification code' });
    }

    // Code verified: clear OTP and issue full login token
    user.twoFactorOtp = undefined;
    await user.save();

    const token = generateToken(user._id);
    await recordSessionAndNotify(user, req);

    await logAuditEvent({
      req,
      user,
      action: '2FA Verification',
      result: 'Success',
      details: `2FA verified and session started for ${user.email}`,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        securitySettings: user.securitySettings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '2FA verification failed', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
        securitySettings: user.securitySettings || {
          twoFactor: false,
          loginNotifications: true,
          sessionManagement: true,
        },
        sessions: user.sessions || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department, phone, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (department) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already taken by another account' });
      }
      user.email = email;
    }

    await user.save();

    await logAuditEvent({
      req,
      user,
      action: 'Profile Updated',
      result: 'Success',
      details: `User profile updated for ${user.email}`,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
        securitySettings: user.securitySettings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

export const updateSecuritySettings = async (req, res) => {
  try {
    const { twoFactor, loginNotifications, sessionManagement } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.securitySettings = {
      twoFactor: twoFactor !== undefined ? Boolean(twoFactor) : user.securitySettings?.twoFactor ?? false,
      loginNotifications: loginNotifications !== undefined ? Boolean(loginNotifications) : user.securitySettings?.loginNotifications ?? true,
      sessionManagement: sessionManagement !== undefined ? Boolean(sessionManagement) : user.securitySettings?.sessionManagement ?? true,
    };

    await user.save();

    await logAuditEvent({
      req,
      user,
      action: 'Security Settings Updated',
      result: 'Success',
      details: `Security settings updated: 2FA=${user.securitySettings.twoFactor}, Login Alerts=${user.securitySettings.loginNotifications}, Sessions=${user.securitySettings.sessionManagement}`,
    });

    res.status(200).json({
      success: true,
      message: 'Security settings updated successfully',
      securitySettings: user.securitySettings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update security settings', error: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const client = parseClientInfo(req);

    const sessions = (user.sessions || []).map((s, idx) => ({
      sessionId: s.sessionId,
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      lastActive: s.lastActive,
      isCurrent: idx === 0,
    }));

    res.status(200).json({
      success: true,
      currentClient: client,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load sessions', error: error.message });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = await User.findById(req.user._id);

    if (sessionId === 'all-other') {
      if (user.sessions && user.sessions.length > 0) {
        user.sessions = [user.sessions[0]]; // Keep current
      }
    } else {
      user.sessions = (user.sessions || []).filter((s) => s.sessionId !== sessionId);
    }

    await user.save();

    await logAuditEvent({
      req,
      user,
      action: 'Session Terminated',
      result: 'Success',
      details: sessionId === 'all-other' ? 'All other active sessions revoked' : `Session ${sessionId} terminated`,
    });

    res.status(200).json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to revoke session', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await logAuditEvent({
      req,
      user,
      action: 'Password Changed',
      result: 'Success',
      details: `Password changed successfully for ${user.email}`,
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
};
