// routes/classRoutes.js
const express = require("express");
const { getFutureClassReservations, getClassesByClub,getClassesByTypeAndDays } = require("../controllers/classController");

const router = express.Router();

router.post("/reservations", getFutureClassReservations);
router.post("/classesByClub", getClassesByClub);
router.post("/getAvailableClassTimes", getClassesByTypeAndDays);
module.exports = router;