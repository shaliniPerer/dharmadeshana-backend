const jwt = require("jsonwebtoken");
const { sendSMS } = require("../config/sms");
const OTP = require("../models/OTP");
const User = require("../models/User");
const Admin = require("../models/Admin");

// Generate random OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

exports.requestOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    console.log("OTP Request received for:", phoneNumber);

    if (!phoneNumber || phoneNumber.trim().length < 9) {
      console.log("Invalid phone number format");
      return res.status(400).json({
        success: false,
        message: "Valid phone number required",
      });
    }

    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    // Save OTP to database
    console.log("Saving OTP to database...");
    await OTP.save(phoneNumber, otp);
    console.log("OTP saved successfully");

    // Send SMS via Notify.lk
    console.log("Sending SMS...");
    const smsResult = await sendSMS(
      phoneNumber,
      `Your Dharmadeshana login code is: ${otp}. This code expires in 10 minutes.`
    );
    console.log("SMS Result:", smsResult);

    if (!smsResult.success) {
      console.error("SMS sending failed:", smsResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
        debug: smsResult.error,
      });
    }

    console.log("OTP sent successfully");
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your phone",
    });
  } catch (error) {
    console.error("Request OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
      debug: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP required",
      });
    }

    // Verify OTP
    const otpVerification = await OTP.verify(phoneNumber, otp);

    if (!otpVerification.valid) {
      return res.status(401).json({
        success: false,
        message: otpVerification.message,
      });
    }

    // Get or create user
    const user = await User.getOrCreate(phoneNumber);

    // Generate JWT Token
    const token = jwt.sign(
      {
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      isAdmin: user.isAdmin,
      phoneNumber: user.phoneNumber,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Note: This is a placeholder for user profile.
    // The admin login does not create a user profile in the 'users' table.
    // This is intended for phone-based user logins.
    if (req.user && req.user.phoneNumber) {
      const user = await User.getByPhone(req.user.phoneNumber);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.json({
        success: true,
        user,
      });
    }
    // If it's an admin logged in via username/password, there's no profile to fetch.
    // We can return a generic success or the admin user's identity.
    if (req.user && req.user.username) {
        return res.json({
            success: true,
            user: {
                username: req.user.username,
                isAdmin: true
            }
        });
    }

    return res.status(404).json({
        success: false,
        message: "No user context found",
      });

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the profile.",
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Admin login attempt:', { username });

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required",
      });
    }

    const admin = await Admin.getByUsername(username);

    if (!admin) {
      console.log('Admin not found:', username);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log('Admin found, comparing password...');
    const isMatch = await Admin.comparePassword(password, admin.password);

    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log('Login successful for admin:', username);
    const token = jwt.sign(
      { username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      token,
      username: admin.username,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};