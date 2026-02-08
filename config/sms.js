const axios = require("axios");

const sendSMS = async (phoneNumber, message) => {
  try {
    // Sanitize phone number: remove any non-numeric characters and handle leading zero
    let formattedNumber = phoneNumber.replace(/\D/g, "");
    if (formattedNumber.startsWith("0")) {
      formattedNumber = formattedNumber.substring(1);
    }
    if (!formattedNumber.startsWith("94")) {
      formattedNumber = `94${formattedNumber}`;
    }

    console.log("Sending SMS to:", formattedNumber);

    // Try multiple Notify.lk endpoints (some may have DNS issues)
    const endpoints = [
      "https://app.notify.lk/api/v1/send",
      "https://www.notify.lk/api/v1/send",
      "http://app.notify.lk/api/v1/send"
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const params = new URLSearchParams({
          user_id: process.env.SMS_USER_ID,
          api_key: process.env.SMS_API_KEY,
          sender_id: process.env.SMS_SENDER_ID,
          to: formattedNumber,
          message: message
        });

        const url = `${endpoint}?${params.toString()}`;
        console.log(`Trying: ${endpoint}`);

        const response = await axios.get(url, {
          timeout: 15000,
          validateStatus: (status) => status >= 200 && status < 500
        });

        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        // Check if successful
        if (response.status === 200) {
          // Handle different response formats
          if (typeof response.data === 'object' && 
              (response.data.status === 'success' || response.data.status === 0)) {
            console.log("✓ SMS sent successfully via", endpoint);
            return { success: true, data: response.data };
          } else if (typeof response.data === 'string' && 
                     !response.data.includes('<!DOCTYPE')) {
            // Plain text success response
            console.log("✓ SMS sent successfully via", endpoint);
            return { success: true, data: response.data };
          }
        }

        lastError = new Error("Invalid response format");
      } catch (err) {
        console.log(`✗ Failed with ${endpoint}:`, err.message);
        lastError = err;
        continue;
      }
    }

    // All endpoints failed
    throw lastError || new Error("All SMS endpoints failed");

  } catch (error) {
    console.error("✗ SMS sending error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = { sendSMS };