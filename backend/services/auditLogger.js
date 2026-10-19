import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  req,
  user = null,
  userName = 'Unknown',
  document = null,
  documentName = 'General',
  action,
  result = 'Success',
  details = '',
}) => {
  try {
    const ipAddress =
      req?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';

    const userAgent = req?.headers['user-agent'] || 'Web Client';

    const finalUserId = user?._id || req?.user?._id || null;
    const finalUserName = user?.name || req?.user?.name || userName;

    await AuditLog.create({
      user: finalUserId,
      userName: finalUserName,
      document: document?._id || document || null,
      documentName: document?.name || documentName,
      action,
      result,
      ipAddress,
      userAgent,
      details,
    });
  } catch (error) {
    console.error('[Audit Logger Error]', error.message);
  }
};
