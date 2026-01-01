require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing Email Configuration...');
    // Mask the email for privacy in logs, show first 3 chars
    const email = process.env.EMAIL_USER || '';
    console.log(`User: ${email}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing EMAIL_USER or EMAIL_PASS in .env file');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log(`Attempting to send test email to self (${process.env.EMAIL_USER})...`);
        const info = await transporter.sendMail({
            from: `"FrameFlow Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self to maximize delivery chance
            subject: "FrameFlow Connection Test",
            text: "If you are reading this, your backend email configuration is PERECT! You can now receive OTPs."
        });
        console.log(`✅ Email sent! ID: ${info.messageId}`);
        console.log('Check your INBOX or SPAM folder now.');
    } catch (error) {
        console.error('❌ Email Failed with error:');
        console.error(error.message);
        if (error.code === 'EAUTH') {
            console.error('--> TIP: This is an Authentication Error. check your App Password.');
        }
    }
};

testEmail();
