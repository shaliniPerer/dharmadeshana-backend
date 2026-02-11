require('dotenv').config();
const sendEmail = require('../utils/email');

const test = async () => {
    console.log('--- Email Configuration Debug ---');
    console.log(`EMAIL_USER: '${process.env.EMAIL_USER}'`); // Quotes help see spaces
    console.log(`SMTP_HOST: '${process.env.SMTP_HOST || 'smtp.gmail.com'}'`);
    console.log(`SMTP_PORT: '${process.env.SMTP_PORT || 587}'`);
    
    const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD;
    console.log(`Password configured: ${password ? 'YES' : 'NO'}`);
    if (password) {
        console.log(`Password length: ${password.length}`);
        console.log(`First char: ${password[0]}`);
        console.log(`Last char: ${password[password.length - 1]}`);
    }
    console.log('---------------------------------');

    if (!process.env.EMAIL_USER || !password) {
        console.error('❌ Error: Missing credentials in .env file.');
        return;
    }

    const result = await sendEmail({
        email: process.env.EMAIL_USER, // Sends to the same email as sender for testing
        subject: 'Dharmadeshana Email Setup Test',
        message: `This is a test email sent from ${process.env.EMAIL_USER} using host ${process.env.SMTP_HOST || 'default'}.`,
        html: `<h1>Email Configuration Test</h1>
               <p><strong>Sent From:</strong> ${process.env.EMAIL_USER}</p>
               <p><strong>Host:</strong> ${process.env.SMTP_HOST || 'default'}</p>
               <p>If you are reading this, your email configuration is valid.</p>`
    });

    if (result) {
        console.log('✅ Email sent successfully to', process.env.EMAIL_USER);
    } else {
        console.log('❌ Email failed to send. Check your credentials and SMTP settings.');
    }
};

test();