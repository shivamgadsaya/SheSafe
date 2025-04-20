/**
 * Email Service Utility
 * 
 * This file provides functions for sending emails from the application.
 * For a production environment, you would replace this with a real email provider
 * like SendGrid, Mailgun, AWS SES, etc.
 * 
 * Note: For production usage, you'll need to install nodemailer:
 * npm install nodemailer --save
 */

// Require nodemailer for sending emails
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create a transporter object
let transporter;

// If in production, use actual credentials
// Otherwise use ethereal.email for testing
if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  // For development, create a test account on ethereal.email
  // This allows viewing emails without actually sending them
  (async function() {
    try {
      // Generate test SMTP service account
      // Only needs to be done once in your application
      let testAccount = await nodemailer.createTestAccount();

      console.log('Created test email account:');
      console.log('- Email:', testAccount.user);
      console.log('- Password:', testAccount.pass);

      // Create a SMTP transporter object
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (error) {
      console.error('Failed to create test email account:', error);
      // Fallback to console logging if email setup fails
      transporter = null;
    }
  })();
}

/**
 * Send a password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetLink - Password reset link
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    console.log('Sending password reset email to:', email);
    console.log('Reset link:', resetLink);
    
    // Define email content
    const mailOptions = {
      from: process.env.EMAIL_USER || '"SheSafe Support" <support@shesafe.com>',
      to: email,
      subject: 'Reset Your SheSafe Password',
      text: `Hello,\n\nYou requested a password reset for your SheSafe account.\n\nPlease click the following link to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this password reset, please ignore this email.\n\nThank you,\nThe SheSafe Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366f1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SheSafe</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your SheSafe account.</p>
            <p>Please click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; font-size: 14px;"><a href="${resetLink}">${resetLink}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <p>Thank you,<br>The SheSafe Team</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© ${new Date().getFullYear()} SheSafe. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // If transporter exists, send email
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      console.log('- Message ID:', info.messageId);
      
      // If using Ethereal, provide the URL to preview the email
      if (info.testMessageUrl) {
        console.log('- Preview URL:', info.testMessageUrl);
      }
      
      return true;
    } else {
      // If no transporter available, log the email content for debugging
      console.log('----------------------------------------');
      console.log('DEVELOPMENT MODE: Email would be sent in production');
      console.log('----------------------------------------');
      console.log('To:', email);
      console.log('Subject: Reset Your SheSafe Password');
      console.log('Reset Link:', resetLink);
      console.log('----------------------------------------');
      console.log('Check the frontend application for a development link display');
      console.log('----------------------------------------');
      
      // Return true for development mode
      return true;
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail
}; 