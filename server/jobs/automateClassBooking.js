const dayjs = require("dayjs");
const pool = require("../db/mysql");
const { logger } = require("../utils/logger");
require("dotenv").config();
const env = process.env.NODE_ENV || "production"; // Default to production if not set


const {sendAppriseNotification, sendEmailNotification} = require("../services/notificationService");
const {generateEmailTemplate} = require("../utils/emailTemplates");
const {convertTo12HourFormat, convertTo24HourFormat} = require("../utils/dateTimeUtils");
const {
    authenticate,
    fetchClasses,
    getAvailableSpots,
    reserveSpot
} = require("../services/apiClient");



/**
 * Automates class booking for a specific class and time.
 * @param {string} className - Name of the class (e.g., "CS4").
 * @param {string} classTime - The time of the class (e.g., "18:30:00").
 * @param {string} classDay - The day of the week for this class.
 */
const automateClassBooking = async (className, classTime, classDay, inputDate=null) => {
    logger.info(`🔄 Starting booking automation for ${className} at ${convertTo12HourFormat(classTime)} on ${classDay}`);

    try {
        // Fetch user preferences and their credentials
        const [users] = await pool.query(
            `SELECT up.user_id, up.className, up.classTime, up.classDay, 
                u.username, u.email, u.first_name, u.last_name, u.mobile  
             FROM UserPreferences up
             JOIN Users u ON up.user_id = u.id
             WHERE up.className = ? AND up.classTime = ? AND up.classDay = ?`,
            [className, convertTo24HourFormat(classTime), classDay]
        );

        if (users.length === 0) {
            logger.info(`🚫 No users found with preference for ${className} at ${classTime} on ${classDay}`);
            return;
        }

        for (const user of users) {
            const { user_id, username, email, first_name, last_name, mobile } = user;
            logger.info(`🔑 Authenticating ${username} (User ID: ${user_id}) to book ${className}`);

            // Authenticate user
            const token = await authenticate(user_id);
            if (!token) {
                logger.info(`⚠️ Failed authentication for ${username}, skipping...`);
                continue;
            }

            // Calculate the booking date (7 days in advance)
            const targetDate = env ==='production' ? dayjs().add(7, "day").format("YYYY-MM-DD") : dayjs(inputDate).format("YYYY-MM-DD");
            logger.info(`📅 Searching ${className} for ${username} on ${targetDate}`);

            // Fetch available classes
            const classData = await fetchClasses(user_id, targetDate);
            if (!classData || !classData.Value) {
                logger.info(`🚫 No available ${className} classes for ${targetDate}`);
                continue;
            }

            // Find the class matching name and time
            const targetClass = classData.Value.find(
                (cls) => {
                    if(cls.className.toLowerCase() === className.toLowerCase()){
                        console.info(`Found class: ${cls.className} at ${cls.START_TIME}`)
                    }
                    if(cls.className.toLowerCase() === className.toLowerCase() && cls.START_TIME.includes(convertTo12HourFormat(classTime))){
                         logger.info(cls.className, cls.className.toLowerCase() === className.toLowerCase());
                         return cls;

                     }
                }
            );
          
            if (!targetClass) {
                logger.info(`⚠️ No matching ${className} class found at ${classTime}`);
                continue;
            }

            logger.info(`✅ Found class: ID ${targetClass.CLASS_SCHEDULES_ID}`);

            const findLowestNumberSpot = (spots) => {
                return spots
                    .filter((spot) => spot.Available && /^\d+$/.test(spot.Text) && parseInt(spot.Text, 10) > 0) // Ensure spot is available and a valid number > 0
                    .sort((a, b) => parseInt(a.Text, 10) - parseInt(b.Text, 10)) // Sort by lowest number
                    .shift(); // Get the lowest available spot
            };
            // Get available spots
            const spots = await getAvailableSpots(user_id, targetClass);
            if (!spots || spots.Items.length === 0) {
                logger.info("🚫 No spots available.");
                continue;
            }


            const lowestSpot = findLowestNumberSpot(spots.Items);
            

            if (!lowestSpot) {
                logger.info("🚫 No suitable spot found.");
                continue;
            }

            logger.info(`📌 Lowest available spot: ${lowestSpot.Text}`);

            // Attempt to reserve the class
            if(env == 'development'){
                logger.info("Skipping reservation in development environment");
                logger.info({
                    userID: user_id,
                    class: targetClass.CLASS_SCHEDULES_ID,
                    spot: lowestSpot.Id,
                    time: targetClass.START_TIME
                });
                return;
                
            }
            const reservationResponse = await reserveSpot(
                user_id,
                targetClass.CLASS_SCHEDULES_ID,
                lowestSpot.Id,
                targetClass.START_TIME
            );

            if (reservationResponse && reservationResponse.Success) {
            
                // Extract message & error details
                const { Message, CurrentServerTime, ServerTimeZoneOffset, Value } = reservationResponse;
                const { ClassReservationID, ErrorID, ErrorMsg } = Value;
            
                // Determine if booking was actually successful
                const bookingConfirmed = ClassReservationID && ClassReservationID !== 0;

                // Extract user details
                const userDetails = `👤 User: ${username} \n`;

                let notificationMessage = `📅 Class Booking Status for ${className} at ${classTime}\n\n`;
            
                if (bookingConfirmed) {
                    // Class was successfully booked
                    notificationMessage += `🎉 Booking Confirmed! ✅\n`;
                    notificationMessage += `📌 Spot Reserved: ${Value.SpotDisplayNumber || "Unknown"}\n`;
                } else {
                    // Class was NOT successfully booked
                    notificationMessage += `❌ Booking Failed\n`;
                    notificationMessage += `⚠️ Reason: ${ErrorMsg || Message || "Unknown error"}\n`;
                }
            
                notificationMessage += `🕒 Server Time: ${CurrentServerTime}\n`;
                notificationMessage += `🌎 Timezone Offset: ${ServerTimeZoneOffset}`;
            
                logger.info(notificationMessage);
                
                // Send notification with booking status
                sendAppriseNotification(notificationMessage);

                // Generate the HTML email content
                const htmlEmail = generateEmailTemplate(first_name, last_name, className, targetClass.START_TIME, bookingConfirmed ? "Success" : "Failed", Value.SpotDisplayNumber);

                // Send the email
                if(email){
                    sendEmailNotification(email, `Class Booking ${bookingConfirmed ? "Confirmed" : "Failed"}`, notificationMessage, htmlEmail);
                }

            
            } else {
                logger.info(`⚠️ Booking failed for ${className} at ${classTime}.`);
            
                let failureMessage = `❌ Booking Failed for ${className} at ${classTime}\n`;
                failureMessage += `👤 User: ${first_name} ${last_name} | 📧 Email: ${email}\n`;
                failureMessage += `🚫 Reason: ${reservationResponse?.Message || "Unknown error occurred"}`;

                 // Generate HTML email for failure
                const failureHtmlEmail = generateEmailTemplate(first_name, last_name, className, targetClass.START_TIME, failureMessage);
                if (email) {
                    sendEmailNotification(email, "Class Booking Failed", failureMessage, failureHtmlEmail);
                }
            
                sendAppriseNotification(failureMessage);
            }
        }
    } catch (error) {
        logger.error("❌ Error during class booking automation:", error);
    }
};

module.exports = automateClassBooking;