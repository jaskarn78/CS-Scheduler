// routes/bookingRoutes.js
const express = require("express");
const { getSpotBookingData, reserveClass } = require("../controllers/bookingController");

const router = express.Router();

router.post("/spot-booking-data", getSpotBookingData);
router.post("/reserve-class", reserveClass);

module.exports = router;