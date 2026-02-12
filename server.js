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
const debugRoutes = require("./routes/debugRoutes");

const app = express();

// Development and production allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://dharmadeshana.lk",
  process.env.ADMIN_FRONTEND_URL || "https://admin.dharmadeshana.lk",
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://dharmadeshana.lk",
  "https://admin.dharmadeshana.lk"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow server-to-server, Postman, curl, and direct navigation
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// REQUIRED for preflight
app.options("*", cors());



// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

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
app.use("/api/debug", debugRoutes);

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
