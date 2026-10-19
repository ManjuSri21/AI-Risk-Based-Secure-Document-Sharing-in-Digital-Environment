import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    accessMethod: {
      type: String,
      enum: ['link', 'qr', 'email'],
      default: 'link',
    },
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
    requireOtp: {
      type: Boolean,
      default: true,
    },
    otpCode: {
      type: String,
      default: null,
      select: false,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    passwordVerifiedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    downloadPerm: {
      type: String,
      enum: ['View Only', 'Allow Download', '1 Time Download', '2 Times Download', '3 Times Download', 'Unlimited Download'],
      default: 'View Only',
    },
    controls: {
      password: { type: Boolean, default: true },
      otp: { type: Boolean, default: true },
      watermark: { type: Boolean, default: true },
      expiry: { type: Boolean, default: true },
      downloadRestriction: { type: Boolean, default: true },
      audit: { type: Boolean, default: true },
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Revoked'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

// Check if share is expired
shareSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt || this.status === 'Expired';
};

export default mongoose.model('Share', shareSchema);
