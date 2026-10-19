import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'Unknown',
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    documentName: {
      type: String,
      default: 'General',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    result: {
      type: String,
      enum: ['Success', 'Blocked', 'Warning'],
      default: 'Success',
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Web Client',
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
