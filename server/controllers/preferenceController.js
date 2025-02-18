const { saveUserPreferences, getUserPreferences, deletePreference } = require("../services/preferenceService.js");

/**
 * Handles saving user preferences.
 */
const savePreferences = async (req, res) => {
    const { userID, preferences } = req.body;

    if (!userID || !Array.isArray(preferences) || preferences.length === 0) {
        return res.status(400).json({ error: "Invalid input. Ensure userID and preferences array are provided." });
    }

    try {
        const success = await saveUserPreferences(userID, preferences);
        if (success) {
            res.json({ success: true, message: "Preferences saved successfully!" });
        } else {
            res.status(500).json({ error: "Failed to save preferences." });
        }
    } catch (error) {
        console.error("❌ Error saving preferences:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

/**
 * Handles retrieving user preferences.
 */
const getPreferences = async (req, res) => {
    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: "Missing userID" });
    }

    try {
        const preferences = await getUserPreferences(userID);
        res.json({ success: true, preferences });
    } catch (error) {
        console.error("❌ Error fetching user preferences:", error);
        res.status(500).json({ error: "Failed to fetch user preferences." });
    }
};

const deleteUserPreference = async (req, res) => {
    const { userId, className, classTime } = req.body;

    if (!userId || !className || !classTime) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const success = await deletePreference(userId, className, classTime);
        if (success) {
            res.json({ success: true, message: "Preference deleted successfully!" });
        } else {
            res.status(500).json({ error: "Failed to delete preference." });
        }
    } catch (error) {
        console.error("❌ Error deleting preference:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = { savePreferences, getPreferences,deleteUserPreference };