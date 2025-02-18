const pool = require("../db/mysql"); // Import database connection

/**
 * Saves user preferences for class scheduling, storing each day as a separate row.
 * @param {number} userID - The ID of the user.
 * @param {string} className - The class name.
 * @param {string} classTime - The selected class time.
 * @param {Array} classDays - An array of selected days.
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise.
 */
const saveUserPreferences = async (userID, preferences) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const { className, classTime, classDay } of preferences) {
            // Check if this specific (userID, class, time, day) entry already exists
            const [existingPreference] = await connection.query(
                "SELECT * FROM UserPreferences WHERE user_id= ? AND className = ? AND classTime = ? AND classDay = ?",
                [userID, className, classTime, classDay]
            );

            if (existingPreference.length === 0) {
                // Insert if it doesn't exist
                await connection.query(
                    "INSERT INTO UserPreferences (user_id, className, classTime, classDay) VALUES (?, ?, ?, ?)",
                    [userID, className, classTime, classDay]
                );
            }
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error saving user preferences:", error);
        return false;
    } finally {
        connection.release();
    }
};

/**
 * Retrieves user preferences grouped by class and time.
 * @param {number} userID - The ID of the user.
 * @returns {Promise<Array>} - Returns an array of saved preferences.
 */
const getUserPreferences = async (userID) => {
    try {
        const [preferences] = await pool.query(
            `SELECT id, className, classTime, 
                GROUP_CONCAT(classDay ORDER BY FIELD(classDay, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')) AS classDays
             FROM UserPreferences
             WHERE user_id = ?
             GROUP BY className, classTime`,
            [userID]
        );

        return preferences;
    } catch (error) {
        console.error("❌ Error fetching user preferences:", error);
        return [];
    }
};

const deletePreference = async (userId, className, classTime) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM UserPreferences WHERE user_id = ? AND className = ? AND classTime = ?",
            [userId, className, classTime]
        );

        return result.affectedRows > 0; // Return true if rows were deleted
    } catch (error) {
        console.error("❌ Error deleting user preferences:", error);
        return false;
    }
};



module.exports = { saveUserPreferences, getUserPreferences,deletePreference };