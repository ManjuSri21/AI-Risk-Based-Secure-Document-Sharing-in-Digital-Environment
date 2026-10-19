import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
    department: {
      type: String,
      default: 'Document Owner',
    },
    phone: {
      type: String,
      default: '',
    },
    securitySettings: {
      twoFactor: {
        type: Boolean,
        default: false,
      },
      loginNotifications: {
        type: Boolean,
        default: true,
      },
      sessionManagement: {
        type: Boolean,
        default: true,
      },
    },
    twoFactorOtp: {
      code: String,
      expiresAt: Date,
    },
    sessions: [
      {
        sessionId: String,
        device: String,
        browser: String,
        ip: String,
        lastActive: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
