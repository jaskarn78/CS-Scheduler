// controllers/profileController.js
const { callLAFitnessAPI } = require("../services/classService");

const getCustomerProfile = async (req, res) => {
    const requestData = {
        request: { Client: require("../config/config").CLIENT }
    };

    try {
        const data = await callLAFitnessAPI("GetCustomerProfile", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customer profile." });
    }
};

module.exports = { getCustomerProfile };