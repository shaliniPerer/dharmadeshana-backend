const ContactMessage = require("../models/ContactMessage");
const sendEmail = require("../utils/email");

// Create a new contact message (Public)
exports.createMessage = async (req, res) => {
  try {
    const { name, phoneNumber, email, subject, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: "නම සහ පණිවිඩය අවශ්‍යයි",
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      phoneNumber,
      email,
      subject,
      message,
    });

    // Send email notification to Admin
    const emailContent = `
      <h2>New Contact Message (Panivida)</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phoneNumber || 'N/A'}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      email: process.env.EMAIL_USER, // Send notification to Admin email
      subject: `New Message from ${name} - Dharmadeshana`,
      message: `New message from ${name}: ${message}`,
      html: emailContent
    });

    res.status(201).json({
      success: true,
      message: "ඔබගේ පණිවිඩය සාර්ථකව යවන ලදී!",
      data: contactMessage,
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(500).json({
      success: false,
      message: "පණිවිඩය යැවීමට අසමත් විය",
    });
  }
};

// Get all messages (Admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.getAll();
    
    // Sort by submittedAt (newest first)
    messages.sort((a, b) => b.submittedAt - a.submittedAt);

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "පණිවිඩ ලබා ගැනීමට අසමත් විය",
    });
  }
};

// Get pending messages (Admin only)
exports.getPendingMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.getByStatus("pending");
    
    // Sort by submittedAt (newest first)
    messages.sort((a, b) => b.submittedAt - a.submittedAt);

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error fetching pending messages:", error);
    res.status(500).json({
      success: false,
      message: "පණිවිඩ ලබා ගැනීමට අසමත් විය",
    });
  }
};

// Update message status (Admin only)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!["pending", "replied", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "වලංගු නොවන තත්ත්වය",
      });
    }

    const message = await ContactMessage.updateStatus(messageId, status);

    res.json({
      success: true,
      message: "පණිවිඩ තත්ත්වය යාවත්කාලීන කරන ලදී",
      data: message,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({
      success: false,
      message: "තත්ත්වය යාවත්කාලීන කිරීමට අසමත් විය",
    });
  }
};

// Delete message (Admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    await ContactMessage.delete(messageId);

    res.json({
      success: true,
      message: "පණිවිඩය මකා දමන ලදී",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "පණිවිඩය මකා දැමීමට අසමත් විය",
    });
  }
};
