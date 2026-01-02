const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');
const brevoTransport = require('nodemailer-brevo-transport');

const recipientEmail = process.argv[2];

if (!recipientEmail) {
    console.error("Please provide an email address as an argument.");
    console.log("Usage: node scripts/test-email-simple.js <your-email>");
    process.exit(1);
}

console.log("Checking environment...");
if (!process.env.BREVO_API_KEY) {
    console.error("❌ BREVO_API_KEY is missing in .env");
    process.exit(1);
} else {
    console.log("✅ BREVO_API_KEY found (length: " + process.env.BREVO_API_KEY.length + ")");
}

console.log("Configuring transporter...");
let transporter;
try {
    transporter = nodemailer.createTransport(new brevoTransport({
        apiKey: process.env.BREVO_API_KEY
    }));
} catch (err) {
    console.error("Error creating transporter:", err);
    process.exit(1);
}

const mailOptions = {
    from: process.env.BREVO_SENDER_EMAIL || '"FrameFlow Debug" <noreply@frameflow.app>',
    to: recipientEmail,
    subject: 'Test Email from FrameFlow Debugger',
    text: 'This is a test email to verify that your Brevo configuration is working correctly. If you received this, the system is operational.',
    html: '<h3>FrameFlow Email Test</h3><p>This is a test email to verify that your Brevo configuration is working correctly.</p><p>If you received this, the system is operational.</p>'
};

console.log(`Attempting to send email to ${recipientEmail}...`);

transporter.sendMail(mailOptions)
    .then((info) => {
        console.log("✅ Message sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("Full Info:", JSON.stringify(info, null, 2));
    })
    .catch((error) => {
        console.log("❌ Error occurred sending email:");
        console.error(error);

        if (error.responseCode) {
            console.log(`Response Code: ${error.responseCode}`);
        }
    });
