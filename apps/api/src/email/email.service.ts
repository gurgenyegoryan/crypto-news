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
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`;

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
                throw error;
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
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Subscription</a>
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
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details</a>
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
}
