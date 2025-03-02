const dayjs = require("dayjs");
const pool = require("../db/mysql");
const { logger } = require("../utils/logger");
require("dotenv").config();
const env = process.env.NODE_ENV || "production"; 

const { sendAppriseNotification, sendEmailNotification } = require("../services/notificationService");
const { generateEmailTemplate } = require("../utils/emailTemplates");
const { convertTo12HourFormat, convertTo24HourFormat } = require("../utils/dateTimeUtils");
const { authenticate, fetchClasses, getAvailableSpots, reserveSpot } = require("../services/apiClient");

/**
 * Automates class booking for a specific class and time.
 * @param {string} className - Name of the class (e.g., "CS4").
 * @param {string} classTime - The time of the class (e.g., "18:30:00").
 * @param {string} classDay - The day of the week for this class.
 */
const automateClassBooking = async (className, classTime, classDay, inputDate = null) => {
    logger.info(`🔄 Starting booking automation for ${className} at ${convertTo12HourFormat(classTime)} on ${classDay}`);

    try {
        // Fetch user preferences and their credentials
        const [users] = await pool.query(
            `SELECT up.user_id, up.className, up.classTime, up.classDay, 
                up.preferredSpot, u.username, u.email, u.first_name, u.last_name, u.mobile,
                u.getConfirmEmail 
             FROM UserPreferences up 
             JOIN Users u ON up.user_id = u.id 
             WHERE up.className = ? AND up.classTime = ? AND up.classDay = ?`,
            [className, convertTo24HourFormat(classTime), classDay]
        );

        if (users.length === 0) {
            logger.info(`🚫 No users found with preference for ${className} at ${classTime} on ${classDay}`);
            return;
        }
        logger.info("Users found: "+users.length)

        for (const user of users) {
            const { user_id, username, email, first_name, last_name, mobile, preferredSpot, getConfirmEmail } = user;
            logger.info(`🔑 Authenticating ${username} (User ID: ${user_id}) to book ${className}`);

            // Authenticate user
            const token = await authenticate(user_id);
            if (!token) {
                logger.info(`⚠️ Failed authentication for ${username}, skipping...`);
                continue;
            }

            // Calculate the booking date (7 days in advance)
            const targetDate = env === "production"
                ? dayjs().add(7, "day").format("YYYY-MM-DD")
                : dayjs(inputDate).format("YYYY-MM-DD");

            logger.info(`📅 Searching ${className} for ${username} on ${targetDate} at ${convertTo12HourFormat(classTime)}`);

            // Fetch available classes
            const classData = await fetchClasses(user_id, targetDate);
            if (!classData || !classData.Value) {
                logger.info(`🚫 No available ${className} classes for ${targetDate}`);
                continue;
            }
         

            // Find the class matching name and time
            const targetClass = classData.Value.find(
                (cls) =>
                    cls.className.toLowerCase() === className.toLowerCase() &&
                    (cls.START_TIME.includes(classTime) || cls.START_TIME.includes(convertTo12HourFormat(classTime)))
            );
            if (env === "development") {
                logger.info(`✅ Found class: ID ${targetClass.CLASS_SCHEDULES_ID} at ${targetClass.START_TIME}`);

            }


            if (!targetClass) {
                logger.info(`⚠️ No matching ${className} class found at ${classTime}`);
                continue;
            }

            logger.info(`✅ Found class: ID ${targetClass.CLASS_SCHEDULES_ID}`);

            // Function to find lowest-numbered available spot
            const findLowestNumberSpot = (spots) => {
                return spots
                    .filter((spot) => spot.Available && /^\d+$/.test(spot.Text) && parseInt(spot.Text, 10) > 0)
                    .sort((a, b) => parseInt(a.Text, 10) - parseInt(b.Text, 10))
                    .shift(); // Get the lowest available spot
            };

            // Get available spots
            const spots = await getAvailableSpots(user_id, targetClass);
            if (!spots || spots.Items.length === 0) {
                logger.info("🚫 No spots available.");
                continue;
            }

            // Attempt to book the preferred spot first
            let selectedSpot = null;

            if (preferredSpot && preferredSpot !== "Any") {
                selectedSpot = spots.Items.find(
                    (spot) => spot.Available && spot.Text === preferredSpot
                );

                if (selectedSpot) {
                    logger.info(`✅ Preferred spot (${preferredSpot}) is available and will be booked.`);
                } else {
                    logger.info(`❌ Preferred spot (${preferredSpot}) is not available. Finding the lowest available spot.`);
                }
            }

            // If the preferred spot is unavailable, pick the lowest available spot
            if (!selectedSpot) {
                selectedSpot = findLowestNumberSpot(spots.Items);
            }

            if (!selectedSpot) {
                logger.info("🚫 No suitable spot found.");
                continue;
            }

            logger.info(`📌 Spot selected for booking: ${selectedSpot.Text}`);

            // Skip reservation in development environment
            // if (env === "development") {
            //     logger.info("Skipping reservation in development environment");
            //     logger.info({
            //         userID: user_id,
            //         class: targetClass.CLASS_SCHEDULES_ID,
            //         spot: selectedSpot.Id,
            //         time: targetClass.START_TIME,
            //     });
            //     return;
            // }

            // Attempt to reserve the class
            const reservationResponse = await reserveSpot(
                user_id,
                targetClass.CLASS_SCHEDULES_ID,
                selectedSpot.Id,
                targetClass.START_TIME
            );

            if (reservationResponse && reservationResponse.Success) {
                const { Message, CurrentServerTime, ServerTimeZoneOffset, Value } = reservationResponse;
                const { ClassReservationID, ErrorID, ErrorMsg } = Value;
                const bookingConfirmed = ClassReservationID && ClassReservationID !== 0;

                let notificationMessage = `📅 Class Booking Status for ${className} at ${convertTo12HourFormat(classTime)}\n\n`;

                if (bookingConfirmed) {
                    notificationMessage += `🎉 Booking Confirmed! ✅\n`;
                    notificationMessage += `📌 Spot Reserved: ${Value.SpotDisplayNumber || "Unknown"}\n`;
                } else {
                    notificationMessage += `❌ Booking Failed\n`;
                    notificationMessage += `⚠️ Reason: ${ErrorMsg || Message || "Unknown error"}\n`;
                }

                notificationMessage += `🕒 Server Time: ${CurrentServerTime}\n`;
                notificationMessage += `🌎 Timezone Offset: ${ServerTimeZoneOffset}`;

                logger.info(notificationMessage);

                // Send notification with booking status
                sendAppriseNotification(notificationMessage);

                // Generate the HTML email content
                const htmlEmail = generateEmailTemplate(first_name, last_name, className, targetClass.START_TIME, bookingConfirmed ? "Success" : "Failed", Value.SpotDisplayNumber, targetClass.InstructorName);

                // Send the email
                if (email && getConfirmEmail) {
                    sendEmailNotification(email, `Class Booking ${bookingConfirmed ? "Confirmed" : "Failed"}`, notificationMessage, htmlEmail);
                }

            } else {
                logger.info(`⚠️ Booking failed for ${className} at ${classTime}.`);

                let failureMessage = `❌ Booking Failed for ${className} at ${classTime}\n`;
                failureMessage += `👤 User: ${first_name} ${last_name} | 📧 Email: ${email}\n`;
                failureMessage += `🚫 Reason: ${reservationResponse?.Message || "Unknown error occurred"}`;

                // Generate HTML email for failure
                const failureHtmlEmail = generateEmailTemplate(first_name, last_name, className, targetClass.START_TIME, failureMessage, "N/A", targetClass.InstructorName);
                if (email && getConfirmEmail) {
                    sendEmailNotification(email, "Class Booking Failed", failureMessage, failureHtmlEmail);
                }

                sendAppriseNotification(failureMessage);
            }
        }
    } catch (error) {
        logger.error("❌ Error during class booking automation:", error);
    }
};
// const className="CS4";
// const classTime="7:30:00 AM";
// const classDay="Thu";
// const inputDate="2025-03-06";
// automateClassBooking(className, classTime, classDay, inputDate);
module.exports = automateClassBooking;
