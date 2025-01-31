// services/authService.js
const axios = require("axios");
const { API_BASE_URL, AUTH_CREDENTIALS, CLIENT } = require("../config/config");

let authToken = null;

const generateAuthorizationHeader = () => {
    const encoded = Buffer.from(`${AUTH_CREDENTIALS.username}:${AUTH_CREDENTIALS.password}`).toString("base64");
    return `Basic ${encoded}`;
};

const authenticate = async () => {
    const requestData = {
        request: {
            Value: {
                Password: AUTH_CREDENTIALS.password,
                Username: AUTH_CREDENTIALS.username
            },
            Client: CLIENT
        }
    };

    try {
        const response = await axios.post(`${API_BASE_URL}/Public.svc/AuthenticateAccount`, requestData, {
            headers: {
                "Host": "publicapi.lafitness.com",
                "accept": "*/*",
                "content-type": "application/json; charset=UTF-8",
                "accept-language": "en-US;q=1",
                "appid": "345281;42798",
                "ver": "4.6.0a",
                "authorization": "Basic Og==", // Include this header exactly as in cURL
                "user-agent": "ClubStudio/1.3.6 (iPhone; iOS 18.3; Scale/3.00)"
            },
            decompress: true
        });

        if (response.data.Success) {
            const fullToken = response.data.Value;
            authToken = fullToken.split("|")[1];  // Extract only token
            console.log("Authentication successful, token retrieved:");
            return authToken;
        } else {
            console.error("Authentication failed:", response.data.Message);
            return null;
        }
    } catch (error) {
        console.error("Error authenticating:", error.response?.data || error.message);
        return null;
    }
};

module.exports = { authenticate, generateAuthorizationHeader };