const axios = require("axios");
const pool = require("../db/mysql");  // Import database connection
const { callLAFitnessAPI } = require("../services/classService");
const { logger } = require("../utils/logger");
const { API_BASE_URL, CLIENT } = require("../config/config");

/**
 * Generates Authorization Header for API requests.
 */
const generateAuthorizationHeader = (username, password) => {
    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
};

/**
 * Authenticates the user and ensures their profile is in the database.
 * - If the user does not exist → Fetch full profile and insert into DB.
 * - If the user exists but has missing data → Fetch full profile and update missing fields.
 */
const authenticate = async (credentials) => {
    const { username, password } = credentials;
    const requestData = {
        request: { Value: { Password: password, Username: username }, Client: CLIENT }
    };

    try {
        // 🔐 Authenticate with API
        const response = await axios.post(`${API_BASE_URL}/Public.svc/AuthenticateAccount`, requestData, {
            headers: {
                "Host": "publicapi.lafitness.com",
                "accept": "*/*",
                "content-type": "application/json; charset=UTF-8",
                "accept-language": "en-US;q=1",
                "appid": "345281;42798",
                "ver": "4.6.0a",
                "authorization": "Basic Og==",
                "user-agent": "ClubStudio/1.3.6 (iPhone; iOS 18.3; Scale/3.00)"
            }
        });

        if (!response.data.Success) {
            logger.error(`❌ Authentication failed for ${username}: ${response.data.Message}`);
            return null;
        }

        const fullToken = response.data.Value;
        const authToken = fullToken.split("|")[1];  // Extract only token

        // 🔍 Check if the user exists in the database
        const [existingUser] = await pool.query("SELECT id, barcode, email, first_name, last_name, mobile FROM Users WHERE username = ?", [username]);

        let userID;
        let barcode = null;

        if (existingUser.length === 0) {
            // 🛑 User does not exist → Fetch Full Profile from API
            logger.info(`🆕 New user detected (${username}) – Fetching full profile...`);
            const profileData = await fetchAndSaveUserProfile(authToken, username, password);
            if (!profileData) {
                logger.error(`❌ Failed to fetch profile data for ${username}.`);
                return null;
            }
            userID = profileData.userID;
            barcode = profileData.barcode;
        } else {
            // ✅ User exists, check for missing fields
            userID = existingUser[0].id;
            barcode = existingUser[0].barcode;

            const missingFields = ["email", "first_name", "last_name", "mobile"].filter(
                (field) => !existingUser[0][field]
            );

            if (missingFields.length > 0) {
                logger.info(`📌 User ${username} has missing data: ${missingFields.join(", ")} – Fetching profile update...`);
                await fetchAndSaveUserProfile(authToken, username, password, userID);
            }
        }

        return { authToken, userID, barcode };
    } catch (error) {
        logger.error("❌ Error authenticating:", error.response?.data || error.message);
        return null;
    }
};

/**
 * Fetches the full user profile from API and inserts/updates the database.
 * @param {string} token - API auth token.
 * @param {string} username - User's username.
 * @param {string} password - User's password.
 * @param {number} existingUserID - (Optional) If user already exists, update instead of insert.
 */
const fetchAndSaveUserProfile = async (token, username, password, existingUserID = null) => {
    try {
        // 🔄 Fetch user profile
        const profileData = await callLAFitnessAPI("GetCustomerProfile", {
            request: { Client: CLIENT },
            token: token,
            authHeader: generateAuthorizationHeader(username, password)
        });

        if (!profileData.Success || !profileData.Value) {
            logger.error(`❌ Failed to fetch profile for ${username}`);
            return null;
        }

        const customer = profileData.Value.CustomerBasic;
        const userProfile = {
            username,
            password_hash: password,
            barcode: customer.LoginBarcodeID || null,
            email: customer.Email || null,
            first_name: customer.FirstName || null,
            last_name: customer.LastName || null,
            mobile: customer.MobilePhone || null,
            member_id: customer.ID || null,
            club_id: customer.ClubID || null
        };

        if (existingUserID) {
            // 🛠️ Update Existing User
            await pool.query(
                `UPDATE Users 
                 SET email = COALESCE(?, email), barcode = COALESCE(?, barcode), 
                     first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), 
                     mobile = COALESCE(?, mobile), member_id = COALESCE(?, member_id), 
                     club_id = COALESCE(?, club_id) 
                 WHERE id = ?`,
                [userProfile.email, userProfile.barcode, userProfile.first_name, userProfile.last_name,
                 userProfile.mobile, userProfile.member_id, userProfile.club_id, existingUserID]
            );
            logger.info(`✅ Updated profile for userID: ${existingUserID}`);
            return { userID: existingUserID, barcode: userProfile.barcode };
        } else {
            // 🆕 Insert New User
            const [insertResult] = await pool.query(
                `INSERT INTO Users (username, password_hash, barcode, email, first_name, last_name, mobile, member_id, club_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userProfile.username, userProfile.password_hash, userProfile.barcode, userProfile.email,
                 userProfile.first_name, userProfile.last_name, userProfile.mobile,
                 userProfile.member_id, userProfile.club_id]
            );
            logger.info(`🆕 New user added: ${username} (ID: ${insertResult.insertId})`);
            return { userID: insertResult.insertId, barcode: userProfile.barcode };
        }
    } catch (error) {
        logger.error(`❌ Error fetching/saving user profile for ${username}:`, error.message);
        return null;
    }
};

module.exports = { authenticate, generateAuthorizationHeader };