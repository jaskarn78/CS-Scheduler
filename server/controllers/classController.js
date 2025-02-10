const { callLAFitnessAPI } = require("../services/classService");
const { CLIENT, CLUB_ID } = require("../config/config");
const db = require('../db/sqlite');

// Convert startDate to MM/DD/YYYY format
const formatDate = (dateString,padStart=true) => {
    const date = new Date(dateString);
    const month = (padStart) ? (date.getMonth() + 1).toString().padStart(2, "0") : date.getMonth() + 1;
    const day = (padStart) ? date.getDate().toString().padStart(2, "0") : date.getDate();
    const year = date.getFullYear();
    return (padStart) ? `${month}/${day}/${year}`.replace(/\//g, "\\/") : `${month}/${day}/${year}`; // Escape slashes
};

const getFutureClassReservations = async (req, res) => {
    const { token, authHeader } = req.body;
    const requestData = {
        request: { Client: CLIENT },
        token: token,
        authHeader: authHeader
    };

    try {
        const data = await callLAFitnessAPI("GetFutureClassReservations", requestData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch future class reservations." });
    }
};

const getClassesByClub = async (req, res) => {
    const { startDate, token,authHeader } = req.body;

    // Validate if startDate is provided
    if (!startDate) {
        return res.status(400).json({ error: "Missing required parameter: startDate" });
    }

    // Convert startDate to MM/DD/YYYY if it's not already in that format
    const formattedDate = formatDate(startDate,true);

    const requestData = {
        request: { Value: { StartDate: startDate, ClubID: CLUB_ID }, Client: CLIENT },
        token: token,
        authHeader: authHeader
    };

    try {
        const data = await callLAFitnessAPI("GetClassesByClubByCustomer", requestData);
        const response = {
            Value:[],
            Success:true
        };
        const rsp = data.Value;
       
        // Use a for...of loop to handle async operations
        for (const classItm of rsp) {
            const classID = classItm.CLASS_SCHEDULES_ID;
            const statusID = classItm.StatusID;
            try {
                const result = await db.query(
                    `SELECT cs.*, if.*, cl2.NAME as className, cl2.DESCRIPTION as classDesc,cl2.WHAT_TO_BRING as classWhatToBring, 
                    cl2.CALORIES as classCalories, cl2.YOUTUBE_ID as classYoutubeID, cg.NAME as category,
                    bc.NAME as brandName, bc.StudioIconId as brandIcon, bc.GeneralGuidelines as brandGuideLines,
                    bc.CLassVideo as brandVideo, bc.ClassVideoThumb as brandVideoThumbnail, css.Description as classStatusDesc,
                    css.ButtonText as classStatusLabel, css.messageText as classStatusMsg, css.TextIndicator as classStatusIndicator 
                    FROM ClassSchedule2 cs 
                    LEFT JOIN Class2 cl2 on cl2.CLASSES_ID = cs.CLASSES_ID 
                    LEFT JOIN ClassCategory cg on cg.ClassCategoryId = cl2.CLASS_CATEGORY_ID	
                    LEFT JOIN InstructorInfo if on if.InstructorId = cs.INSTRUCTOR_ID 
                    LEFT JOIN BrandedClass bc on bc.CLASSES_ID=cl2.CLASSES_ID 
                    LEFT JOIN ClassScheduleStatus css on css.StatusId = ? 
                    WHERE cs.CLASS_SCHEDULES_ID=? and ClassDate LIKE '${formatDate(startDate,false)}%';`,
                    [statusID,classID]
                );
                result[0].extra = classItm;
                response.Value.push(result[0]);
            } catch (dbError) {
                console.error(`Error fetching data for CLASS_SCHEDULES_ID=${classID}:`, dbError);
                response[classID] = { error: "Failed to fetch class data" };
            }
        }

        res.json(response);
    } catch (error) {
        console.error("Error fetching classes by club:", error);
        res.status(500).json({ error: "Failed to fetch classes by club." });
    }
};

module.exports = { getFutureClassReservations, getClassesByClub };