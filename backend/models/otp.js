import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted after 10 minutes
  }
});

// Method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

// Static method to generate a new OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to hash OTP
otpSchema.statics.hashOTP = async function(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

// Static method to compare OTP
otpSchema.statics.compareOTP = async function(otp, otpHash) {
  return bcrypt.compare(otp, otpHash);
};

// Static method to create a new OTP document
otpSchema.statics.createOTP = async function(email) {
  // Delete any existing OTP for this email
  await this.deleteMany({ email });
  
  // Generate new OTP
  const otp = this.generateOTP();
  const otpHash = await this.hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  // Create and save new OTP document
  const otpDoc = new this({
    email,
    otpHash,
    expiresAt
  });
  
  await otpDoc.save();
  return { otpDoc, otp }; // Return both the document and the plain OTP for sending
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp) {
  const otpDoc = await this.findOne({ email });
  
  if (!otpDoc) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  if (otpDoc.isUsed) {
    return { valid: false, message: 'OTP already used' };
  }
  
  if (otpDoc.expiresAt < new Date()) {
    return { valid: false, message: 'OTP expired' };
  }
  
  // Compare the provided OTP with the stored hash
  const isValid = await this.compareOTP(otp, otpDoc.otpHash);
  
  if (!isValid) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();
  
  return { valid: true, message: 'OTP verified successfully' };
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP; 