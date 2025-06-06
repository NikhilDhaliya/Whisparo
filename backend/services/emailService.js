import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS.replace(/\s+/g, '') // Remove any spaces from the password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// Email template for OTP
const createOTPEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2563eb;">SkillSprint</h1>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-bottom: 15px;">Your Verification Code</h2>
        <p style="color: #475569; margin-bottom: 20px;">Please use the following verification code to complete your registration:</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #475569; margin-bottom: 10px;">This code will expire in 10 minutes.</p>
        <p style="color: #475569; margin-bottom: 0;">If you didn't request this code, please ignore this email.</p>
      </div>
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p>This is an automated email, please do not reply.</p>
        <p>&copy; ${new Date().getFullYear()} SkillSprint. All rights reserved.</p>
      </div>
    </div>
  `;
};

// Email template for welcome email
const createWelcomeEmailTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2563eb;">SkillSprint</h1>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-bottom: 15px;">Welcome to SkillSprint!</h2>
        <p style="color: #475569; margin-bottom: 20px;">Hi ${name},</p>
        <p style="color: #475569; margin-bottom: 20px;">Thank you for joining SkillSprint! We're excited to have you on board.</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 10px;">Get Started:</h3>
          <ul style="color: #475569; margin: 0; padding-left: 20px;">
            <li>Create and join hackathon teams</li>
            <li>Connect with other developers</li>
            <li>Participate in exciting hackathons</li>
            <li>Showcase your skills and projects</li>
          </ul>
        </div>
        <p style="color: #475569; margin-bottom: 0;">Get started by exploring hackathons and creating your first team!</p>
      </div>
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p>This is an automated email, please do not reply.</p>
        <p>&copy; ${new Date().getFullYear()} SkillSprint. All rights reserved.</p>
      </div>
    </div>
  `;
};

// Function to send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"SkillSprint" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your SkillSprint Verification Code',
      html: createOTPEmailTemplate(otp)
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error('Failed to send verification email');
  }
};

// Function to send welcome email
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"SkillSprint" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to SkillSprint!',
      html: createWelcomeEmailTemplate(name)
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw new Error('Failed to send welcome email');
  }
};

// Function to verify email configuration
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}; 