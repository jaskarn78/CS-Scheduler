// routes/classRoutes.js
const express = require("express");
const { getFutureClassReservations, getClassesByClub } = require("../controllers/classController");

const router = express.Router();

router.post("/reservations", getFutureClassReservations);
router.post("/classes-by-club", getClassesByClub);

module.exports = router;