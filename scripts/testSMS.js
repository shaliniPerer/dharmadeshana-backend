require("dotenv").config();
const axios = require("axios");

async function testSMS() {
  try {
    const phoneNumber = "0771234567"; // Test number
    const message = "Test SMS from Dharmadeshana";
    
    // Format phone number
    let formattedNumber = phoneNumber.replace(/\D/g, "");
    if (formattedNumber.startsWith("0")) {
      formattedNumber = formattedNumber.substring(1);
    }
    if (!formattedNumber.startsWith("94")) {
      formattedNumber = `94${formattedNumber}`;
    }

    console.log("Testing SMS Gateway (Notify.lk)...");
    console.log("User ID:", process.env.SMS_USER_ID);
    console.log("Sender ID:", process.env.SMS_SENDER_ID);
    console.log("Formatted Number:", formattedNumber);
    console.log("\nSending test SMS...\n");

    const url = `https://api.notify.lk/api/v1/send?user_id=${process.env.SMS_USER_ID}&api_key=${process.env.SMS_API_KEY}&sender_id=${process.env.SMS_SENDER_ID}&to=${formattedNumber}&message=${encodeURIComponent(message)}`;

    const response = await axios.get(url);
    
    console.log("✓ SMS sent successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("✗ SMS sending failed!");
    console.error("Error:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
  }
}

testSMS();
