const nodemailer = require('nodemailer');
const env = require('./env');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const sendEmail = async (options) => {
  const { to, subject, html, text, attachments = [] } = options;
  
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('Email configuration is incomplete. Check SMTP_USER and SMTP_PASS.');
  }
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: env.SMTP_FROM,
    to,
    subject,
    html,
    text,
    attachments,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Phoenix Tender Portal',
    html: `
      <h1>Welcome to Phoenix Tender Portal!</h1>
      <p>Hello ${userName},</p>
      <p>Thank you for registering with Phoenix Tender Portal. You can now access all tender opportunities.</p>
      <p>Best regards,<br>Phoenix Tender Team</p>
    `,
    text: `Welcome to Phoenix Tender Portal! Hello ${userName}, thank you for registering.`,
  });
};

const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  return sendEmail({
    to: userEmail,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Password Reset Request. Click the link to reset your password: ${resetUrl}`,
  });
};

const sendTenderNotification = async (userEmail, tenderTitle, action) => {
  return sendEmail({
    to: userEmail,
    subject: `Tender Update: ${tenderTitle}`,
    html: `
      <h1>Tender Update</h1>
      <p>The tender "<strong>${tenderTitle}</strong>" has been ${action}.</p>
      <p>Login to your account to view more details.</p>
      <p>Best regards,<br>Phoenix Tender Team</p>
    `,
    text: `The tender "${tenderTitle}" has been ${action}.`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendTenderNotification,
  createTransporter,
};