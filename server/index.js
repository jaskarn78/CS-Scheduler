const express = require("express");
const classRoutes = require("./routes/classRoutes");
const profileRoutes = require("./routes/profileRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");

const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// CORS Configuration
app.use(cors({
  origin: "http://192.168.7.200:3001",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type",
}));

// Middleware
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/booking", bookingRoutes);

// Serve React App
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    console.error(`API request not handled: ${req.originalUrl}`);
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});