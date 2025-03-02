const axios = require("axios");
const { formatDate } = require("../utils/dateTimeUtils");
const pool = require("../db/mysql");
require("dotenv").config();

const API_BASE_URL = process.env.API_BASE_URL;

/**
 * Retrieves a user's credentials from the database.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<{username: string, password: string, barCode: string}>}
 */
async function getUserCredentials(userId) {
  try {
    const [rows] = await pool.query(
      "SELECT username, password_hash AS password, barCode FROM Users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      console.error(`❌ No user found with ID ${userId}`);
      return null;
    }

    return rows[0]; // Return user credentials
  } catch (error) {
    console.error("❌ Error fetching user credentials:", error);
    return null;
  }
}

/**
 * Generates an authorization header for a user.
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {string} - The Basic Auth header.
 */
const generateAuthHeader = (username, password) => {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
};

/**
 * Authenticates a user and returns a token.
 * @param {number} userId - The user's ID.
 * @returns {Promise<string>} - The authentication token.
 */
async function authenticate(userId) {
  try {
    const user = await getUserCredentials(userId);
    if (!user) {
      throw new Error(`User ${userId} not found in database.`);
    }

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: user.username,
      password: user.password,
    });

    return response.data.token; // Assuming API returns a token
  } catch (error) {
    console.error(`❌ Authentication failed for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Fetches available classes.
 * @param {number} userId - The user ID for authentication.
 * @param {string} startDate - The date to search for classes.
 * @returns {Promise<Object>} - The class data.
 */
async function fetchClasses(userId, startDate) {
  try {
    const user = await getUserCredentials(userId);
    if (!user) return null;

    const token = await authenticate(userId);
    const authHeader = generateAuthHeader(user.username, user.password);

    const response = await axios.post(
      `${API_BASE_URL}/classes/classesByClub`,
      {
        token: token,
        authHeader: authHeader,
        startDate: formatDate(startDate, "MM/DD/YYYY", false, false),
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch classes for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Retrieves available spots for a class.
 * @param {number} userId - The user ID.
 * @param {Object} targetClass - The class details.
 * @returns {Promise<Array>} - The available spots.
 */
async function getAvailableSpots(userId, targetClass) {
  try {
    const user = await getUserCredentials(userId);
    if (!user) return null;

    const token = await authenticate(userId);
    const authHeader = generateAuthHeader(user.username, user.password);

    const response = await axios.post(`${API_BASE_URL}/booking/spot-booking-data`, {
      classScheduleId: targetClass.CLASS_SCHEDULES_ID,
      classDate: formatDate(targetClass.START_TIME, "MM-DD-YYYY", false, true),
      token: token,
      authHeader: authHeader,
    });

    return response.data.Value;
  } catch (error) {
    console.error(`❌ Failed to fetch available spots for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Reserves a class spot for a user.
 * @param {number} userId - The user ID.
 * @param {number} classScheduleId - The schedule ID of the class.
 * @param {number} spotID - The ID of the spot to reserve.
 * @param {string} classTime - The class time.
 * @returns {Promise<Object>} - The reservation response.
 */
async function reserveSpot(userId, classScheduleId, spotID, classTime) {
  try {
    const user = await getUserCredentials(userId);
    if (!user) return null;

    const token = await authenticate(userId);
    const authHeader = generateAuthHeader(user.username, user.password);

    const response = await axios.post(
      `${API_BASE_URL}/booking/reserve-class`,
      {
        ClassSchedulesID: classScheduleId,
        classTime: formatDate(classTime, "MM-DD-YYYY", false, true),
        bookedSpotID: spotID,
        token: token,
        authHeader: authHeader,
        barCode: user.barCode, // Now using the stored barcode
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data; // Assuming API confirms reservation
  } catch (error) {
    console.error(`❌ Failed to reserve spot for user ${userId}:`, error);
    throw error;
  }
}

module.exports = {
  authenticate,
  fetchClasses,
  getAvailableSpots,
  reserveSpot,
};