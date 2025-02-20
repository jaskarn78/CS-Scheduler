// controllers/profileController.js
const pool = require("../db/mysql");  // Import database connection
const { callLAFitnessAPI } = require("../services/classService");

const getCustomerProfile = async (req, res) => {
    const { token, authHeader, userID, barCode } = req.body;

    const requestData = {
        request: { Client: require("../config/config").CLIENT },
        token: token,
        authHeader: authHeader
    };
    try {
        const data = await callLAFitnessAPI("GetCustomerProfile", requestData);
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customer profile.", });
    }
};

module.exports = { getCustomerProfile };