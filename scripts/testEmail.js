require('dotenv').config();
const sendEmail = require('../utils/email');

const test = async () => {
    console.log('Testing email...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass length:', process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.length : 0);

    const result = await sendEmail({
        email: process.env.EMAIL_USER, // Send to self
        subject: 'Test Email from Dharmadeshana',
        message: 'If you receive this, the email configuration is working correctly.',
        html: '<h1>Email Test</h1><p>Configuration successful!</p>'
    });

    if (result) {
        console.log('✅ Email sent successfully!');
    } else {
        console.log('❌ Email failed to send.');
    }
};

test();