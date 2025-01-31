// controllers/classController.js
const { callLAFitnessAPI } = require("../services/classService");
const { CLIENT, CLUB_ID } = require("../config/config");

 // Convert startDate to MM/DD/YYYY format
 const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`.replace(/\//g, "\\/"); // Escape slashes
};

const getFutureClassReservations = async (req, res) => {
    const requestData = {
        request: {Client: CLIENT },
    };

    try {
        const data = await callLAFitnessAPI("GetFutureClassReservations", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch future class reservations." });
    }
};

const getClassesByClub = async (req, res) => {
    const { startDate } = req.body;
     // Validate if startDate is provided
     if (!startDate) {
        return res.status(400).json({ error: "Missing required parameter: startDate" });
    }

    // Convert startDate to MM/DD/YYYY if it's not already in that format
    const formattedDate = formatDate(startDate);
    console.log("Formatted StartDate:", formattedDate);

    const requestData = {
        request: { Value: { StartDate: startDate, ClubID: CLUB_ID }, Client: CLIENT },
    };

    try {
        console.log("API Request Data:", JSON.stringify(requestData, null, 2));
        const data = await callLAFitnessAPI("GetClassesByClubByCustomer", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch classes by club." });
    }
};

module.exports = { getFutureClassReservations, getClassesByClub };