// controllers/bookingController.js
const { callLAFitnessAPI } = require("../services/classService");
const { CLIENT, RESERVE_TYPE } = require("../config/config");

const getSpotBookingData = async (req, res) => {
    const { classScheduleId, classDate,token,authHeader } = req.body;
 
    const requestData = {
        request: { Value: { ClassScheduleId: classScheduleId, ClassDate: classDate }, Client: CLIENT },
        token: token,
        authHeader:authHeader
    };

    try {
        const data = await callLAFitnessAPI("GetSpotBookingDataForRoom", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch spot booking data." });
    }
};

const reserveClass = async (req, res) => {
    const { ClassSchedulesID, classTime, bookedSpotID,token,authHeader, barCode } = req.body;
    const requestData = {
        request: {
            Value: {
                ClassSchedulesID: ClassSchedulesID,
                ClassTime: classTime,
                ReserveType: RESERVE_TYPE,
                BookedSpotID: bookedSpotID,
                PlatesWalkIn: 0,
                IsSwapping: false,
                Barcode: barCode,
                FromWaitList: 0
            },
            Client: CLIENT
        },
        token: token,
        authHeader: authHeader
       
    };
   
    try {
        const data = await callLAFitnessAPI("ReserveClass", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to reserve the class." });
    }
};
const addToWaitlist = async(req, res)=>{
    const {ClassSchedulesID	,classTime,token,authHeader} = req.body;
    const requestData = {
        request: {Value: {ClassSchedulesID: ClassSchedulesID, ClassDate: classTime}, Client: CLIENT},
        token: token,
        authHeader:authHeader
    };
    try{
        const data = await callLAFitnessAPI("CreateClassWaitlist", requestData);
        res.json(data);
    }catch(error){
        res.status(500).json({error: "Failed to add to class waitlist"});
    }
};

const cancelReservation = async(req, res)=>{
    const {ClassReservationID,TrainingAppointmentID,token,authHeader} = req.body;
    const requestData = {
        request: {Value: {
            ClassReservationID: ClassReservationID, 
            TrainingAppointmentID, TrainingAppointmentID,
            ChangeSourceID: 15,
            ModifiedBy: 32471
        }, Client: CLIENT},
        token: token,
        authHeader:authHeader
    };
    try{
        const data = await callLAFitnessAPI("CancelFutureClassReservation", requestData);
        res.json(data);
    }catch(error){
        res.status(500).json({error: "Failed to add to class waitlist"});
    }
};

const removeFromWaitlist = async(req,res)=>{
    const {waitListID,classTime,token,authHeader,barCode} = req.body;
    const requestData = {
        request: {
            Value: {
                "Interested": false,
                "Barcode": barCode,
                "ReserveType": 2,
                "BookedSpotID": 0,
                "ClassTime": classTime,
               // "ClassTime": "Sat, Feb 15 9:00 AM",
                "WaitlistID": waitListID,
                "ClassSchedulesID": 0,
                "IsSwapping": false
            }, Client: CLIENT},
        token: token,
        authHeader:authHeader
    };
    try{
        const data = await callLAFitnessAPI("UpdateCustomerClassWaitlistForConfirmation", requestData);
        res.json(data);
    }catch(error){
        res.status(500).json({error: "Failed to add to class waitlist"});
    }
};

module.exports = { getSpotBookingData, reserveClass, addToWaitlist,removeFromWaitlist, cancelReservation };