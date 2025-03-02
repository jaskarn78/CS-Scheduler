const { callLAFitnessAPI } = require("../services/classService");
const { CLIENT, CLUB_ID } = require("../config/config");
const db = require('../db/sqlite');
const { formatDate } = require("../utils/dateTimeUtils");
const { logger } = require("../utils/logger");


// Convert startDate to MM/DD/YYYY format

// const formatDate = (dateString, padStart = true) => {
//     if (!dateString) return null; // Handle empty input

//     let year, month, day;

//     if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
//         // ✅ Input format: "YYYY-MM-DD"
//         [year, month, day] = dateString.split("-").map(num => parseInt(num, 10));
//     } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
//         // ✅ Input format: "MM/DD/YYYY"
//         [month, day, year] = dateString.split("/").map(num => parseInt(num, 10));
//     } else {
//         console.error(`❌ Invalid date format: ${dateString}`);
//         return null;
//     }

//     // Ensure valid numbers
//     if (isNaN(month) || isNaN(day) || isNaN(year)) {
//         console.error(`❌ Invalid numeric values in date: ${dateString}`);
//         return null;
//     }

//     // ✅ Create UTC date object to prevent timezone shifts
//     const date = new Date(Date.UTC(year, month - 1, day));

//     if (isNaN(date.getTime())) {
//         console.error(`❌ Invalid date: ${dateString}`);
//         return null;
//     }

//     // Format output
//     const formattedMonth = padStart ? String(date.getUTCMonth() + 1).padStart(2, "0") : date.getUTCMonth() + 1;
//     const formattedDay = padStart ? String(date.getUTCDate()).padStart(2, "0") : date.getUTCDate();
//     const formattedYear = date.getUTCFullYear();

//     return `${formattedMonth}/${formattedDay}/${formattedYear}`;
// };
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
    const { startDate, token,authHeader,className } = req.body;

    let classFilter="";
    // Validate if startDate is provided
    if (!startDate) {
        return res.status(400).json({ error: "Missing required parameter: startDate" });
    }
    if(className){
        classFilter = ` AND cl2.NAME=${className}`
    }

    // Convert startDate to MM/DD/YYYY if it's not already in that format
    const formattedDate = formatDate(startDate, "MM/DD/YYYY", false,false);
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
        // console.log("formattedDate", formatDate(startDate, false))
        // Use a for...of loop to handle async operations
        for (const classItm of rsp) {
            const classID = classItm.CLASS_SCHEDULES_ID;
            const statusID = classItm.StatusID;
            try {
                const result = await db.query(
                    `SELECT cs.*, if.*, cl2.NAME as className, cl2.DESCRIPTION as classDesc,cl2.WHAT_TO_BRING as classWhatToBring, 
                    cl2.CALORIES as classCalories, cl2.YOUTUBE_ID as classYoutubeID, cg.NAME as category,
                    bc.NAME as brandName, bc.StudioIconId as brandIcon, bc.GeneralGuidelines as brandGuideLines,
                    bc.ClassVideo as brandVideo, bc.ClassVideoThumb as brandVideoThumbnail, css.Description as classStatusDesc,
                    css.ButtonText as classStatusLabel, css.messageText as classStatusMsg, css.TextIndicator as classStatusIndicator 
                    FROM ClassSchedule2 cs 
                    LEFT JOIN Class2 cl2 on cl2.CLASSES_ID = cs.CLASSES_ID 
                    LEFT JOIN ClassCategory cg on cg.ClassCategoryId = cl2.CLASS_CATEGORY_ID	
                    LEFT JOIN InstructorInfo if on if.InstructorId = cs.INSTRUCTOR_ID 
                    LEFT JOIN BrandedClass bc on bc.CLASSES_ID=cl2.CLASSES_ID 
                    LEFT JOIN ClassScheduleStatus css on css.StatusId = ? 
                    WHERE cs.CLASS_SCHEDULES_ID=? and ClassDate LIKE '${formattedDate}%' ${classFilter};`,
                    [statusID,classID]
                );
                
                if(result.length > 0){
                    result[0].extra = classItm;
                    response.Value.push(result[0]);
                }else{
                    response[classID] = { error: "No class found for the given date" };
                }
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

const getClassesByTypeAndDays = async (req, res) => {
    const { className, days } = req.body;

    try {
        if (!className || !days || days.length === 0) {
            return res.status(400).json({ error: "Invalid class name or days selection" });
        }

        // Ensure days is an array before querying
        const dayIds = Array.isArray(days) ? days : days.split(",").map(Number);

        const response = { Value: [], Success: true };

        const query = `
            WITH ClassTimes AS (
                SELECT 
                    cl2.NAME AS className, 
                    cs.DAY_ID,
                    strftime('%I:%M %p', cs.StartTime, 'unixepoch') AS StartTime, 
                    strftime('%H:%M:%S', cs.StartTime, 'unixepoch') AS StartTime24
                FROM ClassSchedule2 cs
                LEFT JOIN Class2 cl2 ON cl2.CLASSES_ID = cs.CLASSES_ID
                WHERE cs.club_id = ?
                AND cl2.NAME = ?
                AND DAY_ID IN (${dayIds.map(() => "?").join(",")})  -- Dynamically generate placeholders
            )
            SELECT 
                StartTime
            FROM ClassTimes
            WHERE StartTime24 IN (
                SELECT StartTime24
                FROM ClassTimes
                GROUP BY StartTime24
                HAVING COUNT(DISTINCT DAY_ID) = ?
            )
            GROUP BY StartTime, className
            ORDER BY StartTime24 ASC;
        `;

        const params = [CLUB_ID, className, ...dayIds, dayIds.length];
        const result = await db.query(query, params);
        if (result.length > 0) {
            response.Value = result;
        } else {
            response["message"] = `No available times found for ${className} for the given days. Please try different days or check back later.`;
        }

        res.json(response);
    } catch (error) {
        console.error("❌ Error fetching classes by type and day:", error);
        res.status(500).json({ error: "Failed to fetch classes by type and day." });
    }
};

module.exports = { getFutureClassReservations, getClassesByClub,getClassesByTypeAndDays };