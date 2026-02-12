require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const danweemRoutes = require("./routes/danweemRoutes");
const contactRoutes = require("./routes/contactRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://dharmadeshana.lk",
  process.env.ADMIN_FRONTEND_URL || "https://admin.dharmadeshana.lk",
  "https://www.dharmadeshana.lk",
  "https://www.admin.dharmadeshana.lk"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests from Postman, curl, server-to-server (no origin)
    if (!origin) return callback(null, true);

    // allow if origin matches any in the allowed list
    if (allowedOrigins.some(o => o.toLowerCase() === origin.toLowerCase())) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS request from origin: ${origin}`);
    // instead of throwing Error, respond with 403
    res.status(403).json({ success: false, message: "CORS not allowed for this origin" });
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight OPTIONS globally
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/danweem", danweemRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);

// --------------------
// Health check
// --------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// --------------------
// 404 Handler
// --------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// --------------------
// Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
