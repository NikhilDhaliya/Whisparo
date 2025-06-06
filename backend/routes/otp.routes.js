import express from 'express';
import OTP from '../models/otp.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// Generate and send OTP
router.post('/generate', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Create new OTP
    const { otpDoc, otp } = await OTP.createOTP(email);

    // For development/testing: Return OTP in response
    // TODO: Remove this in production and uncomment the email sending code
    res.status(200).json({
      message: 'OTP generated successfully',
      otp, // Remove this in production
      expiresIn: 10 * 60 // 10 minutes in seconds
    });

    // Uncomment this in production after setting up email service
    // try {
    //   await sendOTPEmail(email, otp);
    //   res.status(200).json({
    //     message: 'OTP sent successfully',
    //     expiresIn: 10 * 60 // 10 minutes in seconds
    //   });
    // } catch (emailError) {
    //   console.error('Error sending email:', emailError);
    //   // Delete the OTP if email sending fails
    //   await OTP.deleteOne({ _id: otpDoc._id });
    //   throw new Error('Failed to send OTP email');
    // }
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

    // For development/testing: Return OTP in response
    // TODO: Remove this in production and uncomment the email sending code
    res.status(200).json({
      message: 'OTP resent successfully',
      otp, // Remove this in production
      expiresIn: 10 * 60 // 10 minutes in seconds
    });

    // Uncomment this in production after setting up email service
    // try {
    //   await sendOTPEmail(email, otp);
    //   res.status(200).json({
    //     message: 'OTP resent successfully',
    //     expiresIn: 10 * 60 // 10 minutes in seconds
    //   });
    // } catch (emailError) {
    //   console.error('Error sending email:', emailError);
    //   // Delete the OTP if email sending fails
    //   await OTP.deleteOne({ _id: otpDoc._id });
    //   throw new Error('Failed to resend OTP email');
    // }
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

export default router; 