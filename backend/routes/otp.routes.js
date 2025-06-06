import express from 'express';
import OTP from '../models/otp.js';
import User from '../models/user.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// Generate and send OTP
router.post('/generate', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists and is already verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Create new OTP
    const { otpDoc, otp } = await OTP.createOTP(email);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: 'OTP sent successfully',
      expiresIn: 10 * 60 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Failed to generate OTP' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const result = await OTP.verifyOTP(email, otp);

    if (!result.valid) {
      return res.status(400).json({ message: result.message });
    }

    // Mark user as verified
    await User.findOneAndUpdate({ email }, { verified: true });

    res.status(200).json({
      message: result.message,
      verified: true
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Resend OTP
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Create new OTP
    const { otpDoc, otp } = await OTP.createOTP(email);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: 'OTP resent successfully',
      expiresIn: 10 * 60 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

export default router; 