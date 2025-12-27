const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [50, 'Full name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm password is required']
  },
  otpMethod: {
    type: String,
    enum: ['Email', 'SMS'],
    default: 'Email'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  registrationSource: {
    type: String,
    enum: ['Web', 'Mobile', 'API'],
    default: 'Web'
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Suspended', 'Deleted'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Indexes for better performance
registrationSchema.index({ email: 1 });
registrationSchema.index({ username: 1 });
registrationSchema.index({ registrationDate: -1 });
registrationSchema.index({ status: 1 });

// Virtual for registration age
registrationSchema.virtual('registrationAge').get(function() {
  return Math.floor((Date.now() - this.registrationDate) / (1000 * 60 * 60 * 24)); // Days
});

// Ensure virtual fields are serialized
registrationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Registration', registrationSchema);