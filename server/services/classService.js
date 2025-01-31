// services/classService.js
const axios = require("axios");
const { API_BASE_URL, CLIENT, CLUB_ID } = require("../config/config");
const { authenticate, generateAuthorizationHeader } = require("./authService");

let authToken = null;

const callLAFitnessAPI = async (endpoint, data) => {
    authToken = await authenticate();
    try {
        const response = await axios.post(`${API_BASE_URL}/Private.svc/${endpoint}`, data, {
            headers: {
                "Host": "publicapi.lafitness.com",
                "content-type": "application/json; charset=UTF-8",
                "appid": "345281;42798",
                "accept": "*/*",
                "authtoken": authToken,
                "authorization": generateAuthorizationHeader(),
                "accept-language": "en-US,en;q=0.9",
                "ver": "4.6.0a",
                "user-agent": "ClubStudio/1.3.6.5 CFNetwork/3826.400.120 Darwin/24.3.0"
            },
            decompress: true
        });

        return response.data;
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.response?.data || error.message);
        throw error;
    }
};

module.exports = { callLAFitnessAPI };