const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("⚠️ Email credentials missing");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: "mail.dharmadeshana.lk",
    port: 465,
    secure: true, // MUST be true for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Dharmadeshana Admin" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error);
    return false;
  }
};

module.exports = sendEmail;
