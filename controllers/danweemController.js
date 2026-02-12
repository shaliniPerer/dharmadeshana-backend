const Danweem = require("../models/Danweem");
const sendEmail = require("../utils/email");

// Create new danweem submission
exports.createDanweem = async (req, res) => {
  try {
    const { theroName, title, description, mediaType, mediaUrl, thumbnailUrl, proofDocumentUrl } = req.body;
    const phoneNumber = req.user.phoneNumber || (req.user.username ? "Admin" : "Unknown");
    const isAdmin = req.user && (req.user.isAdmin || req.user.username);

    if (!theroName || !title || !mediaType || !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Thero name, title, media type, and media URL are required",
      });
    }

    if (!['video', 'image'].includes(mediaType)) {
      return res.status(400).json({
        success: false,
        message: "Media type must be 'video' or 'image'",
      });
    }

    const danweem = await Danweem.create({
      phoneNumber,
      theroName,
      title,
      description,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      proofDocumentUrl,
      status: isAdmin ? "approved" : "pending"
    });

    // Send email notification to Admin if it's a user submission
    if (!isAdmin) {
      const emailContent = `
        <h2>New Danweem (Announcement) Submitted</h2>
        <p><strong>Submitter:</strong> ${phoneNumber}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Thero Name:</strong> ${theroName}</p>
        <p><strong>Type:</strong> ${mediaType}</p>
        <p><strong>Description:</strong> ${description || 'N/A'}</p>
        <br>
        <p>Please login to the Admin Dashboard to review and approve.</p>
      `;

      await sendEmail({
        email: process.env.EMAIL_USER, // Send notification to Admin email
        subject: 'New Danweem Submission - Dharmadeshana',
        message: `New Danweem from ${phoneNumber}: ${title}`,
        html: emailContent
      });
    }

    return res.status(201).json({
      success: true,
      message: isAdmin ? "Danweem created and approved" : "Danweem submitted successfully. Awaiting admin approval.",
      danweem,
    });
  } catch (error) {
    console.error("Create Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting danweem",
    });
  }
};

// Get user's own danweem submissions
exports.getUserDanweem = async (req, res) => {
  try {
    const phoneNumber = req.user.phoneNumber;
    const danweem = await Danweem.getByUser(phoneNumber);

    // Prepend BASE_URL to media paths
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    const danweemWithFullUrls = danweem.map(d => ({
      ...d.toObject ? d.toObject() : d,
      mediaUrl: d.mediaUrl ? `${BASE_URL}${d.mediaUrl}` : null,
      thumbnailUrl: d.thumbnailUrl ? `${BASE_URL}${d.thumbnailUrl}` : null,
      proofDocumentUrl: d.proofDocumentUrl ? `${BASE_URL}${d.proofDocumentUrl}` : null,
    }));

    return res.status(200).json({
      success: true,
      danweem: danweemWithFullUrls,
    });
  } catch (error) {
    console.error("Get User Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching danweem",
    });
  }
};

// Get all approved danweem (public)
exports.getApprovedDanweem = async (req, res) => {
  try {
    const danweem = await Danweem.getByStatus("approved");

    // Prepend BASE_URL to media paths
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    const danweemWithFullUrls = danweem.map(d => ({
      ...d.toObject ? d.toObject() : d, // in case it's a Mongoose doc
      mediaUrl: d.mediaUrl ? `${BASE_URL}${d.mediaUrl}` : null,
      thumbnailUrl: d.thumbnailUrl ? `${BASE_URL}${d.thumbnailUrl}` : null,
      proofDocumentUrl: d.proofDocumentUrl ? `${BASE_URL}${d.proofDocumentUrl}` : null,
    }));

    return res.status(200).json({
      success: true,
      danweem: danweemWithFullUrls,
    });
  } catch (error) {
    console.error("Get Approved Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching danweem",
    });
  }
};


// Get pending danweem (admin only)
exports.getPendingDanweem = async (req, res) => {
  try {
    const danweem = await Danweem.getByStatus("pending");

    // Prepend BASE_URL to media paths
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    const danweemWithFullUrls = danweem.map(d => ({
      ...d.toObject ? d.toObject() : d,
      mediaUrl: d.mediaUrl ? `${BASE_URL}${d.mediaUrl}` : null,
      thumbnailUrl: d.thumbnailUrl ? `${BASE_URL}${d.thumbnailUrl}` : null,
      proofDocumentUrl: d.proofDocumentUrl ? `${BASE_URL}${d.proofDocumentUrl}` : null,
    }));

    return res.status(200).json({
      success: true,
      danweem: danweemWithFullUrls,
    });
  } catch (error) {
    console.error("Get Pending Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching pending danweem",
    });
  }
};

// Get all danweem (admin only)
exports.getAllDanweem = async (req, res) => {
  try {
    const danweem = await Danweem.getAll();

    // Prepend BASE_URL to media paths
    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

    const danweemWithFullUrls = danweem.map(d => ({
      ...d.toObject ? d.toObject() : d,
      mediaUrl: d.mediaUrl ? `${BASE_URL}${d.mediaUrl}` : null,
      thumbnailUrl: d.thumbnailUrl ? `${BASE_URL}${d.thumbnailUrl}` : null,
      proofDocumentUrl: d.proofDocumentUrl ? `${BASE_URL}${d.proofDocumentUrl}` : null,
    }));

    return res.status(200).json({
      success: true,
      danweem: danweemWithFullUrls,
    });
  } catch (error) {
    console.error("Get All Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching danweem",
    });
  }
};

// Approve danweem (admin only)
exports.approveDanweem = async (req, res) => {
  try {
    const { danweemId } = req.params;

    const danweem = await Danweem.getById(danweemId);
    if (!danweem) {
      return res.status(404).json({
        success: false,
        message: "Danweem not found",
      });
    }

    await Danweem.updateStatus(danweemId, "approved");

    return res.status(200).json({
      success: true,
      message: "Danweem approved successfully",
    });
  } catch (error) {
    console.error("Approve Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while approving danweem",
    });
  }
};

// Reject danweem (admin only)
exports.rejectDanweem = async (req, res) => {
  try {
    const { danweemId } = req.params;

    const danweem = await Danweem.getById(danweemId);
    if (!danweem) {
      return res.status(404).json({
        success: false,
        message: "Danweem not found",
      });
    }

    await Danweem.updateStatus(danweemId, "rejected");

    return res.status(200).json({
      success: true,
      message: "Danweem rejected successfully",
    });
  } catch (error) {
    console.error("Reject Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while rejecting danweem",
    });
  }
};

// Delete danweem
exports.deleteDanweem = async (req, res) => {
  try {
    const { danweemId } = req.params;
    const phoneNumber = req.user.phoneNumber;
    const isAdmin = req.user.isAdmin;

    const danweem = await Danweem.getById(danweemId);

    if (!danweem) {
      return res.status(404).json({
        success: false,
        message: "Danweem not found",
      });
    }

    // Check if user owns this danweem or is admin
    if (danweem.phoneNumber !== phoneNumber && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this danweem",
      });
    }

    await Danweem.delete(danweemId);

    return res.status(200).json({
      success: true,
      message: "Danweem deleted successfully",
    });
  } catch (error) {
    console.error("Delete Danweem Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting danweem",
    });
  }
};
