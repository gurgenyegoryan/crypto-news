
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the api .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    // Don't log the password

    if (!process.env.SMTP_HOST) {
        console.error('SMTP_HOST is not defined in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Test" <noreply@example.com>',
            to: process.env.SMTP_USER, // Send to self for testing
            subject: 'Test Email from Debug Script',
            text: 'If you receive this, email sending is working correctly.',
            html: '<b>If you receive this, email sending is working correctly.</b>',
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

testEmail();
