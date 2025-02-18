// routes/bookingRoutes.js
const express = require("express");
const { getSpotBookingData, reserveClass, addToWaitlist, removeFromWaitlist,cancelReservation } = require("../controllers/bookingController");

const router = express.Router();

router.post("/spot-booking-data", getSpotBookingData);
router.post("/reserve-class", reserveClass);
router.post("/addToWaitList", addToWaitlist);
router.post("/removeFromWaitList", removeFromWaitlist);
router.post("/cancel",cancelReservation)

module.exports = router;