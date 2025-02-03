// controllers/bookingController.js
const { callLAFitnessAPI } = require("../services/classService");
const { CLIENT, RESERVE_TYPE } = require("../config/config");

const getSpotBookingData = async (req, res) => {
    const { classScheduleId, classDate } = req.body;

    const requestData = {
        request: { Value: { ClassScheduleId: classScheduleId, ClassDate: classDate }, Client: CLIENT },
    };

    try {
        const data = await callLAFitnessAPI("GetSpotBookingDataForRoom", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch spot booking data." });
    }
};

const reserveClass = async (req, res) => {
    const { classSchedulesID, classTime, bookedSpotID } = req.body;
    const requestData = {
        request: {
            Value: {
                ClassSchedulesID: classSchedulesID,
                ClassTime: classTime,
                ReserveType: RESERVE_TYPE,
                BookedSpotID: bookedSpotID,
                PlatesWalkIn: 0,
                IsSwapping: false,
                Barcode: "7RAKNP439IA",
                FromWaitList: 0
            }
        },
        Client: CLIENT
    };

    try {
        const data = await callLAFitnessAPI("ReserveClass", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to reserve the class." });
    }
};

module.exports = { getSpotBookingData, reserveClass };