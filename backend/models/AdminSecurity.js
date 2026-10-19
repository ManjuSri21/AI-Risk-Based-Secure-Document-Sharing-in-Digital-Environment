import mongoose from 'mongoose';

const adminSecuritySchema = new mongoose.Schema(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
    },
    algorithm: {
      type: String,
      default: 'AES-256',
    },
    encryptedKeyMaterial: {
      type: String,
      required() {
        return !this.revokedAt;
      },
    },
    iv: {
      type: String,
      required() {
        return !this.revokedAt;
      },
    },
    authTag: {
      type: String,
      required() {
        return !this.revokedAt;
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rotatedAt: {
      type: Date,
      default: Date.now,
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      default: 'Routine rotation',
    },
  },
  {
    timestamps: true,
  }
);

adminSecuritySchema.index(
  { active: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

export default mongoose.model('AdminSecurity', adminSecuritySchema);
