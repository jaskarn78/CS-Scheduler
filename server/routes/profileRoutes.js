// routes/profileRoutes.js
const express = require("express");
const { getCustomerProfile } = require("../controllers/profileController");

const router = express.Router();

router.get("/my-profile", getCustomerProfile);

module.exports = router;