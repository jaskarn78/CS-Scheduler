// routes/classRoutes.js
const express = require("express");
const { savePreferences, getPreferences, deleteUserPreference,getSettings, updateEmailPreference } = require("../controllers/preferenceController");

const router = express.Router();

router.post("/savePreferences", savePreferences);
router.post("/getPreferences", getPreferences);
router.post("/deletePreference", deleteUserPreference);
router.post("/updateEmailPreference", updateEmailPreference);
router.post("/getSettings", getSettings);

module.exports = router;