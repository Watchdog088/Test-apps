import nodemailer from 'nodemailer';
import logger from '../config/logger';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use Ethereal Email for development
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASSWORD || 'ethereal.pass'
      }
    });
  }

  // Production email service (SendGrid, AWS SES, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const templates = {
  'email-verification': (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1877f2;">Welcome to ConnectHub, ${data.name}!</h2>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.verificationLink}" 
           style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${data.verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">
        If you didn't create an account with ConnectHub, please ignore this email.
      </p>
    </div>
  `,

  'password-reset': (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1877f2;">Password Reset Request</h2>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your password for your ConnectHub account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}" 
           style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${data.resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p><strong>If you didn't request this password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">
        For security reasons, this link can only be used once.
      </p>
    </div>
  `,

  'welcome': (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1877f2;">Welcome to ConnectHub! 🎉</h2>
      <p>Hi ${data.name},</p>
      <p>Your email has been successfully verified! Welcome to the ConnectHub community.</p>
      <p>Here are some things you can do to get started:</p>
      <ul>
        <li>Complete your profile with a photo and bio</li>
        <li>Find and follow your friends</li>
        <li>Share your first post</li>
        <li>Explore the dating features</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Get Started
        </a>
      </div>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy connecting!</p>
      <p>The ConnectHub Team</p>
    </div>
  `
};

export const sendEmail = async ({ to, subject, template, data }: EmailData): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    // Get template
    const templateFunction = templates[template as keyof typeof templates];
    if (!templateFunction) {
      throw new Error(`Email template '${template}' not found`);
    }

    const htmlContent = templateFunction(data);

    const mailOptions = {
      from: {
        name: 'ConnectHub',
        address: process.env.FROM_EMAIL || 'noreply@connecthub.com'
      },
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Email sent to ${to}: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      logger.info(`Email sent to ${to}: ${info.messageId}`);
    }
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

// Utility function to send bulk emails (for notifications, etc.)
export const sendBulkEmails = async (emails: EmailData[]): Promise<void> => {
  const transporter = createTransporter();
  
  try {
    const promises = emails.map(async (emailData) => {
      const templateFunction = templates[emailData.template as keyof typeof templates];
      if (!templateFunction) {
        logger.error(`Email template '${emailData.template}' not found`);
        return;
      }

      const htmlContent = templateFunction(emailData.data);

      const mailOptions = {
        from: {
          name: 'ConnectHub',
          address: process.env.FROM_EMAIL || 'noreply@connecthub.com'
        },
        to: emailData.to,
        subject: emailData.subject,
        html: htmlContent
      };

      try {
        await transporter.sendMail(mailOptions);
        logger.info(`Bulk email sent to ${emailData.to}`);
      } catch (error) {
        logger.error(`Failed to send bulk email to ${emailData.to}:`, error);
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    logger.error('Failed to send bulk emails:', error);
    throw new Error('Failed to send bulk emails');
  }
};

// Helper functions for specific email types
export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string): Promise<void> => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth.html?reset=${resetToken}`;
  
  await sendEmail({
    to: email,
    subject: 'Reset Your ConnectHub Password',
    template: 'password-reset',
    data: {
      name,
      resetLink
    }
  });
};

export const sendEmailVerification = async (email: string, name: string, verificationToken: string): Promise<void> => {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken}`;
  
  await sendEmail({
    to: email,
    subject: 'Verify Your ConnectHub Email',
    template: 'email-verification',
    data: {
      name,
      verificationLink
    }
  });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Welcome to ConnectHub! 🎉',
    template: 'welcome',
    data: {
      name
    }
  });
};

export default { 
  sendEmail, 
  sendBulkEmails, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  sendWelcomeEmail 
};
