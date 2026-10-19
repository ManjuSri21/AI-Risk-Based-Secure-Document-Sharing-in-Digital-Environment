import mongoose from 'mongoose';

const adminSecuritySettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
      required: true,
    },
    hardwareMfa: {
      type: Boolean,
      default: true,
    },
    socAlerts: {
      type: Boolean,
      default: true,
    },
    immutableAudit: {
      type: Boolean,
      default: true,
    },
    sessionTimeout: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('AdminSecuritySettings', adminSecuritySettingsSchema);
