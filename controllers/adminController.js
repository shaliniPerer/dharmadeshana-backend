const Event = require("../models/Event");
const User = require("../models/User");
const Danweem = require("../models/Danweem");

exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.getByStatus("pending");

    return res.status(200).json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error("Get Pending Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending events",
    });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAll();

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get All Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.updateStatus(eventId, "approved");

    return res.status(200).json({
      success: true,
      message: "Event approved successfully",
    });
  } catch (error) {
    console.error("Approve Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve event",
    });
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.updateStatus(eventId, "rejected");

    return res.status(200).json({
      success: true,
      message: "Event rejected",
    });
  } catch (error) {
    console.error("Reject Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject event",
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.delete(eventId);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const pendingEvents = await Event.getByStatus("pending");
    const approvedEvents = await Event.getByStatus("approved");
    const rejectedEvents = await Event.getByStatus("rejected");

    return res.status(200).json({
      success: true,
      stats: {
        pending: pendingEvents.length,
        approved: approvedEvents.length,
        rejected: rejectedEvents.length,
        total: pendingEvents.length + approvedEvents.length + rejectedEvents.length,
      },
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    const allEvents = await Event.getAll();
    const allDanweem = await Danweem.getAll();

    // Count events and danweem for each user
    const usersWithCounts = users.map(user => {
      const eventsCount = allEvents.filter(e => e.submitterPhone === user.phoneNumber).length;
      const danweemCount = allDanweem.filter(d => d.submitterPhone === user.phoneNumber).length;
      
      return {
        ...user,
        eventsCount,
        danweemCount,
      };
    });

    return res.status(200).json({
      success: true,
      users: usersWithCounts,
      count: usersWithCounts.length,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};