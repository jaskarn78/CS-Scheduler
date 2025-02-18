// routes/classRoutes.js
const express = require("express");
const { savePreferences, getPreferences, deleteUserPreference } = require("../controllers/preferenceController");

const router = express.Router();

router.post("/savePreferences", savePreferences);
router.post("/getPreferences", getPreferences);
router.post("/deletePreference", deleteUserPreference);

module.exports = router;