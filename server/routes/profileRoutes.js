// routes/profileRoutes.js
const express = require("express");
const { getCustomerProfile } = require("../controllers/profileController");

const router = express.Router();

router.post("/my-profile", getCustomerProfile);

module.exports = router;