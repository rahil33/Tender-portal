const mailConfig = require('../config/mail');
const logger = require('../config/logger');

class EmailService {
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const result = await mailConfig.sendWelcomeEmail(userEmail, userName);
      logger.info('Welcome email sent', { email: userEmail });
      return result;
    } catch (error) {
      logger.error('Failed to send welcome email', { email: userEmail, error: error.message });
      throw error;
    }
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    try {
      const result = await mailConfig.sendPasswordResetEmail(userEmail, resetToken);
      logger.info('Password reset email sent', { email: userEmail });
      return result;
    } catch (error) {
      logger.error('Failed to send password reset email', { email: userEmail, error: error.message });
      throw error;
    }
  }

  async sendTenderNotification(userEmail, tenderTitle, action) {
    try {
      const result = await mailConfig.sendTenderNotification(userEmail, tenderTitle, action);
      logger.info('Tender notification email sent', { email: userEmail, tender: tenderTitle });
      return result;
    } catch (error) {
      logger.error('Failed to send tender notification', { email: userEmail, error: error.message });
      throw error;
    }
  }

  async sendCustomEmail(options) {
    try {
      const { to, subject, html, text, attachments } = options;
      const result = await mailConfig.sendEmail({ to, subject, html, text, attachments });
      logger.info('Custom email sent', { to, subject });
      return result;
    } catch (error) {
      logger.error('Failed to send custom email', { to: options.to, error: error.message });
      throw error;
    }
  }

  async sendBulkEmail(recipients, subject, html, text) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const recipient of recipients) {
      try {
        await mailConfig.sendEmail({
          to: recipient,
          subject,
          html,
          text,
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ email: recipient, error: error.message });
      }
    }

    logger.info('Bulk email completed', results);
    return results;
  }
}

module.exports = new EmailService();