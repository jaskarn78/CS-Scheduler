// index.js
const express = require("express");
const classRoutes = require("./routes/classRoutes");
const profileRoutes = require("./routes/profileRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;
app.use(cors());
  
app.use(express.json());
app.use(express.static(path.join(__dirname, "../cs-class-scheduler-frontend/build")));
// Register routes
app.use("/api/classes", classRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/booking", bookingRoutes);


// Serve the React app for all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../cs-class-scheduler-frontend/build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});