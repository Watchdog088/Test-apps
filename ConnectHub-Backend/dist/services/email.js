"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkEmails = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../config/logger"));
const createTransporter = () => {
    if (process.env.NODE_ENV === 'development') {
        return nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
                pass: process.env.EMAIL_PASSWORD || 'ethereal.pass'
            }
        });
    }
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};
const templates = {
    'email-verification': (data) => `
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
    'password-reset': (data) => `
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
    'welcome': (data) => `
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
const sendEmail = async ({ to, subject, template, data }) => {
    try {
        const transporter = createTransporter();
        const templateFunction = templates[template];
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
            logger_1.default.info(`Email sent to ${to}: ${nodemailer_1.default.getTestMessageUrl(info)}`);
        }
        else {
            logger_1.default.info(`Email sent to ${to}: ${info.messageId}`);
        }
    }
    catch (error) {
        logger_1.default.error('Failed to send email:', error);
        throw new Error('Failed to send email');
    }
};
exports.sendEmail = sendEmail;
const sendBulkEmails = async (emails) => {
    const transporter = createTransporter();
    try {
        const promises = emails.map(async (emailData) => {
            const templateFunction = templates[emailData.template];
            if (!templateFunction) {
                logger_1.default.error(`Email template '${emailData.template}' not found`);
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
                logger_1.default.info(`Bulk email sent to ${emailData.to}`);
            }
            catch (error) {
                logger_1.default.error(`Failed to send bulk email to ${emailData.to}:`, error);
            }
        });
        await Promise.allSettled(promises);
    }
    catch (error) {
        logger_1.default.error('Failed to send bulk emails:', error);
        throw new Error('Failed to send bulk emails');
    }
};
exports.sendBulkEmails = sendBulkEmails;
exports.default = { sendEmail: exports.sendEmail, sendBulkEmails: exports.sendBulkEmails };
//# sourceMappingURL=email.js.map