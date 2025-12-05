import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        if (process.env.SMTP_HOST) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            this.logger.log('Email service initialized with SMTP');
        } else {
            this.logger.warn('SMTP configuration missing. Email service running in MOCK mode (logging to console).');
        }
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://https://api.cryptomonitor.app'}/verify?token=${token}`;

        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #333;">Verify your email address</h2>
        <p>Welcome to CryptoMonitor! Please click the button below to verify your email address and activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="font-size: 12px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #666;">Link: <a href="${verificationUrl}">${verificationUrl}</a></p>
      </div>
    `;

        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: process.env.SMTP_FROM || '"CryptoMonitor" <noreply@cryptomonitor.app>',
                    to: email,
                    subject: 'Verify your email - CryptoMonitor',
                    html,
                });
                this.logger.log(`Verification email sent to ${email}`);
            } catch (error) {
                this.logger.error(`Failed to send email to ${email}`, error);
                // Don't throw error to prevent breaking the auth flow
                // In production, you might want to queue this for retry
            }
        } else {
            this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: Verify your email | Link: ${verificationUrl}`);
        }
    }

    async sendExpiryReminder(email: string, daysRemaining: number) {
        const subject = `Subscription Expiring in ${daysRemaining} Days - CryptoMonitor`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #333;">Subscription Expiring Soon</h2>
                <p>Your premium subscription will expire in <strong>${daysRemaining} days</strong>.</p>
                <p>Renew now to continue enjoying real-time whale alerts, advanced security scanning, and more.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://https://api.cryptomonitor.app'}/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Subscription</a>
                </div>
            </div>
        `;

        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: process.env.SMTP_FROM || '"CryptoMonitor" <noreply@cryptomonitor.app>',
                    to: email,
                    subject,
                    html,
                });
                this.logger.log(`Expiry reminder email sent to ${email}`);
            } catch (error) {
                this.logger.error(`Failed to send expiry reminder to ${email}`, error);
            }
        } else {
            this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
        }
    }

    async sendWhaleAlert(email: string, alertData: any) {
        const subject = `Whale Alert: ${alertData.token} - CryptoMonitor`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #333;">🐳 Whale Alert Detected</h2>
                <p>A large transaction has been detected matching your alert criteria.</p>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Token:</strong> ${alertData.token}</li>
                    <li><strong>Amount:</strong> ${alertData.amount}</li>
                    <li><strong>Value:</strong> ${alertData.valueUsd}</li>
                    <li><strong>From:</strong> ${alertData.from}</li>
                    <li><strong>To:</strong> ${alertData.to}</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://https://api.cryptomonitor.app'}/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details</a>
                </div>
            </div>
        `;

        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: process.env.SMTP_FROM || '"CryptoMonitor" <noreply@cryptomonitor.app>',
                    to: email,
                    subject,
                    html,
                });
                this.logger.log(`Whale alert email sent to ${email}`);
            } catch (error) {
                this.logger.error(`Failed to send whale alert to ${email}`, error);
            }
        } else {
            this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(90deg, #7c3aed 0%, #ec4899 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi there,
                            </p>
                            <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We received a request to reset your password for your <strong style="color: #a78bfa;">CryptoMonitor</strong> account.
                            </p>
                            <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Click the button below to create a new password. This link will expire in <strong style="color: #fbbf24;">1 hour</strong> for security reasons.
                            </p>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #7c3aed 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; padding: 20px; background-color: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid #7c3aed;">
                                <strong>Button not working?</strong> Copy and paste this link into your browser:<br>
                                <a href="${resetUrl}" style="color: #a78bfa; word-break: break-all;">${resetUrl}</a>
                            </p>
                            
                            <!-- Security Notice -->
                            <div style="margin-top: 30px; padding: 20px; background-color: rgba(239, 68, 68, 0.1); border-radius: 8px; border-left: 4px solid #ef4444;">
                                <p style="color: #fca5a5; font-size: 14px; line-height: 1.6; margin: 0;">
                                    <strong>⚠️ Security Notice:</strong><br>
                                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: rgba(0,0,0,0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
                            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                                <strong style="color: #a78bfa;">CryptoMonitor</strong> - Your Crypto Intelligence Platform
                            </p>
                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                © 2024 CryptoMonitor. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: process.env.SMTP_FROM || '"CryptoMonitor" <noreply@cryptomonitor.app>',
                    to: email,
                    subject: '🔐 Reset Your Password - CryptoMonitor',
                    html,
                });
                this.logger.log(`Password reset email sent to ${email}`);
            } catch (error) {
                this.logger.error(`Failed to send password reset email to ${email}`, error);
                // Don't throw error to prevent breaking the auth flow
            }
        } else {
            this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: Reset Your Password | Link: ${resetUrl}`);
        }
    }
}
