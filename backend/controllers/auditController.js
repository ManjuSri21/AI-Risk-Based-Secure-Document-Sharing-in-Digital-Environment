import AuditLog from '../models/AuditLog.js';
import Document from '../models/Document.js';

const authActions = ['OTP Verified', 'Password Entered', 'Failed OTP', 'Logged In', 'Account Created'];
const downloadActions = ['Downloaded', 'Unauthorized Download'];
const sharingActions = ['Shared', 'Link Expired'];

export const getMyAuditLogs = async (req, res) => {
  try {
    const { filter, search } = req.query;

    const myDocs = await Document.find({ owner: req.user._id }).select('_id');
    const myDocIds = myDocs.map((d) => d._id);

    const query = {
      $or: [{ user: req.user._id }, { document: { $in: myDocIds } }, { userName: req.user.name }],
    };

    if (filter && filter !== 'ALL') {
      if (filter === 'Success') query.result = 'Success';
      else if (filter === 'Blocked') query.result = 'Blocked';
      else if (filter === 'Authentication') query.action = { $in: authActions };
      else if (filter === 'Downloads') query.action = { $in: downloadActions };
      else if (filter === 'Sharing') query.action = { $in: sharingActions };
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { documentName: { $regex: search, $options: 'i' } },
            { userName: { $regex: search, $options: 'i' } },
            { action: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100);

    const formattedLogs = logs.map((log) => ({
      id: log._id,
      timestamp: log.createdAt,
      date: new Date(log.createdAt).toLocaleDateString(),
      user: log.userName,
      document: log.documentName,
      action: log.action,
      ip: log.ipAddress,
      result: log.result,
      details: log.details,
    }));

    res.status(200).json({ success: true, count: formattedLogs.length, logs: formattedLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
  }
};

export const getAdminAuditLogs = async (req, res) => {
  try {
    const { filter, search } = req.query;
    const query = {};

    if (filter && filter !== 'ALL') {
      if (filter === 'Success') query.result = 'Success';
      else if (filter === 'Blocked') query.result = 'Blocked';
      else if (filter === 'Authentication') query.action = { $in: authActions };
      else if (filter === 'Downloads') query.action = { $in: downloadActions };
      else if (filter === 'Sharing') query.action = { $in: sharingActions };
    }

    if (search) {
      query.$or = [
        { documentName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(250);

    const formattedLogs = logs.map((log) => ({
      id: log._id,
      timestamp: log.createdAt,
      date: new Date(log.createdAt).toLocaleDateString(),
      user: log.userName,
      document: log.documentName,
      action: log.action,
      ip: log.ipAddress,
      result: log.result,
      details: log.details,
    }));

    res.status(200).json({ success: true, count: formattedLogs.length, logs: formattedLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin audit logs', error: error.message });
  }
};

export const clearAllAuditLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({});
    res.status(200).json({
      success: true,
      message: 'All audit logs cleared successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear audit logs', error: error.message });
  }
};
