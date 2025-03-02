const express = require("express");
const schedule = require("node-schedule");
const cors = require("cors");
const path = require("path");

const {logger, logRequests} = require("./utils/logger");

const classRoutes = require("./routes/classRoutes");
const profileRoutes = require("./routes/profileRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
//const automateClassBooking = require("./jobs/automateClassBooking");
const updateDatabase = require("./jobs/updateDatabase");
const {scheduleBookings} = require("./jobs/scheduleBooking");
const { sendAppriseNotification } = require("./services/notificationService");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
const corsOptions = {
    origin: ["http://192.168.7.200:3001", "http://localhost:3001", "http://192.168.7.23:3001", "http://192.168.7.180:3001", "http://192.168.7.180:3000", "http://192.168.7.23:3000"], // Allow frontend URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true // Allow cookies & authentication headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(logRequests);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/preferences", preferenceRoutes);

// ✅ Serve React App
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        logger.error(`🚫 API request not handled: ${req.originalUrl}`);
        return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ✅ Start Server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📅 Current system time: ${new Date().toLocaleString()}`);
});

// ✅ Scheduling Automation Jobs
const scheduleJob = (cronExp, jobFunction, name) => {
    schedule.scheduleJob(cronExp, jobFunction);
    console.log(`📅 Scheduled job: ${name}`);
};


scheduleBookings();
//Update the database every Friday at 11:00 AM
scheduleJob({ hour: 11, minute: 0, dayOfWeek: new schedule.Range(5, 5) }, () => {
    sendAppriseNotification("Updating sqllite database");
    updateDatabase();
}, "Database Update");


