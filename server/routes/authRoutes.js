const express = require("express");
const { authenticate } = require("../services/authService");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

  try {
    // Temporarily overwrite credentials for authentication
    const response = await authenticate({ username, password });

    if (response) {
      return res.status(200).json({ success: true, token: response });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;