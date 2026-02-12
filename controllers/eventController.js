const Event = require("../models/Event");
const sendEmail = require("../utils/email");

// Helper to prepend full URL to media
const prependBaseUrl = (url) => {
  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
  return url ? `${BASE_URL}${url}` : null;
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const { theroName, eventName, date, time, venue, imageUrl, description, sanwidanaya, proofDocumentUrl } = req.body;

    if (!theroName || !eventName || !date || !time || !venue || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const isAdmin = req.user && (req.user.isAdmin || req.user.username);
    const submitterPhone = isAdmin ? "Admin" : (req.user.phoneNumber || "Unknown");

    const eventData = {
      theroName,
      eventName,
      date,
      time,
      venue,
      imageUrl,
      description: description || "",
      sanwidanaya: sanwidanaya || "",
      proofDocumentUrl: proofDocumentUrl || "",
      submitterPhone,
      submitterName: isAdmin ? "Admin" : "Member",
      status: isAdmin ? "approved" : "pending",
    };

    const event = await Event.create(eventData);

    // Send email notification if user submitted
    if (!isAdmin) {
      const emailContent = `
        <h2>New Dharmadeshana (Event) Submitted</h2>
        <p><strong>Submitter:</strong> ${submitterPhone}</p>
        <p><strong>Thero Name:</strong> ${theroName}</p>
        <p><strong>Event Name:</strong> ${eventName}</p>
        <p><strong>Date/Time:</strong> ${date} at ${time}</p>
        <p><strong>Venue:</strong> ${venue}</p>
        <p><strong>Sanwidanaya:</strong> ${sanwidanaya || 'N/A'}</p>
        <p><strong>Description:</strong> ${description || 'N/A'}</p>
        <br>
        <p>Please login to the Admin Dashboard to review and approve.</p>
      `;

      await sendEmail({
        email: process.env.EMAIL_USER,
        subject: 'New Event Submission - Dharmadeshana',
        message: `New Event from ${submitterPhone}: ${eventName} by ${theroName}`,
        html: emailContent
      });
    }

    // Prepend BASE_URL for frontend display
    const eventWithFullUrls = {
      ...event.toObject ? event.toObject() : event,
      imageUrl: prependBaseUrl(event.imageUrl),
      proofDocumentUrl: prependBaseUrl(event.proofDocumentUrl),
    };

    return res.status(201).json({
      success: true,
      message: isAdmin ? "Event created and approved" : "Event submitted for approval",
      event: eventWithFullUrls,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// Get all approved events (public)
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.getByStatus("approved");

    const eventsWithFullUrls = events.map(e => ({
      ...e.toObject ? e.toObject() : e,
      imageUrl: prependBaseUrl(e.imageUrl),
      proofDocumentUrl: prependBaseUrl(e.proofDocumentUrl),
    }));

    return res.status(200).json({
      success: true,
      events: eventsWithFullUrls,
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// Get user's own events
exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.getBySubmitter(req.user.phoneNumber);

    const eventsWithFullUrls = events.map(e => ({
      ...e.toObject ? e.toObject() : e,
      imageUrl: prependBaseUrl(e.imageUrl),
      proofDocumentUrl: prependBaseUrl(e.proofDocumentUrl),
    }));

    return res.status(200).json({
      success: true,
      events: eventsWithFullUrls,
    });
  } catch (error) {
    console.error("Get User Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your events",
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.getById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const eventWithFullUrls = {
      ...event.toObject ? event.toObject() : event,
      imageUrl: prependBaseUrl(event.imageUrl),
      proofDocumentUrl: prependBaseUrl(event.proofDocumentUrl),
    };

    return res.status(200).json({
      success: true,
      event: eventWithFullUrls,
    });
  } catch (error) {
    console.error("Get Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};
