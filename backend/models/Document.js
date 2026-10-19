import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: 'PDF',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    sizeFormatted: {
      type: String,
      default: '1.0 MB',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      default: 'General Document',
    },
    predictedRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    finalRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    riskScore: {
      type: Number,
      default: 20,
    },
    aiConfidence: {
      type: Number,
      default: 92,
    },
    modelVersion: {
      type: Number,
      default: 1,
    },
    policyReason: {
      type: String,
      default: 'Evaluated by trained Decision Tree risk model',
    },
    riskFeatures: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    riskAssessmentMethod: {
      type: String,
      enum: ['RULES', 'ML_DECISION_TREE'],
      default: 'ML_DECISION_TREE',
    },
    reviewedRiskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
    },
    riskReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    riskReviewedAt: {
      type: Date,
    },
    sensitiveInfo: {
      type: [String],
      default: [],
    },
    extractedSummary: {
      type: String,
      default: '',
    },
    policy: {
      encryption: { type: String, default: 'AES-256' },
      authentication: { type: String, default: 'Basic Link' },
      accessDuration: { type: String, default: '24 Hours' },
      downloadLimit: { type: String, default: 'Allowed' },
      watermark: { type: String, default: 'Disabled' },
      auditLogging: { type: String, default: 'Enabled' },
      recipientVerification: { type: String, default: 'None' },
    },
    status: {
      type: String,
      enum: ['Protected', 'Shared', 'Archived', 'Suspended', 'Quarantined', 'Rejected'],
      default: 'Protected',
    },
    documentStatus: {
      type: String,
      enum: ['QUARANTINED', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    quarantinePath: {
      type: String,
      default: '',
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
