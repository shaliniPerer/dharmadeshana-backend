const Media = require("../models/Media");

exports.createMedia = async (req, res) => {
  try {
    const { type, title, description, url, thumbnailUrl, theroName, category } = req.body;
    const phoneNumber = req.user.phoneNumber; // From auth middleware

    if (!type || !title || !url) {
      return res.status(400).json({
        success: false,
        message: "Type, title, and URL are required",
      });
    }

    if (!['video', 'image'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'video' or 'image'",
      });
    }

    const media = await Media.create({
      phoneNumber,
      type,
      title,
      description,
      url,
      thumbnailUrl,
      theroName,
      category: category || 'dharma_deshana',
    });

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      media,
    });
  } catch (error) {
    console.error("Create Media Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while uploading media",
    });
  }
};

exports.getUserMedia = async (req, res) => {
  try {
    const phoneNumber = req.user.phoneNumber;
    const media = await Media.getByUser(phoneNumber);

    return res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("Get User Media Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching media",
    });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const { category } = req.query;
    
    let media;
    if (category) {
      media = await Media.getByCategory(category);
    } else {
      media = await Media.getAll();
    }

    return res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("Get All Media Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching media",
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const phoneNumber = req.user.phoneNumber;

    const media = await Media.getById(mediaId);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Check if user owns this media or is admin
    if (media.phoneNumber !== phoneNumber && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this media",
      });
    }

    await Media.delete(mediaId);

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete Media Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting media",
    });
  }
};
