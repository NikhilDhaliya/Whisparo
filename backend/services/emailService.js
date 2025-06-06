import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
      from: 'SkillSprint <onboarding@resend.dev>',
      to: email,
      subject: 'Your SkillSprint Verification Code',
      html: createOTPEmailTemplate(otp)
    });

    if (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send verification email');
    }

    return true;
  } catch (error) {
    console.error('Error in sendOTPEmail:', error);
    throw new Error('Failed to send verification email');
  }
};

// Function to send welcome email
export const sendWelcomeEmail = async (email, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SkillSprint <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to SkillSprint!',
      html: createWelcomeEmailTemplate(name)
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }

    return true;
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Function to verify email configuration
export const verifyEmailConfig = async () => {
  try {
    // Resend doesn't have a direct verify method, but we can test by sending a test email
    const { error } = await resend.emails.send({
      from: 'SkillSprint <onboarding@resend.dev>',
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>'
    });

    if (error) {
      console.error('Email configuration error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}; 