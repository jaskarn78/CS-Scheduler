const schedule = require("node-schedule");
const dayjs = require("dayjs");
const pool = require("../db/mysql");
const automateClassBooking = require("./automateClassBooking");
const { logger } = require("../utils/logger");

logger.info("🔄 Setting up dynamic class booking automation...");

/**
 * Maps weekday names to `node-schedule` indexes.
 */
const dayMapping = {
    "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3,
    "Thu": 4, "Fri": 5, "Sat": 6
};

/**
 * Schedules class booking jobs dynamically.
 */
const scheduleBookings = async () => {
    try {
        // Fetch all user preferences
        const [preferences] = await pool.query("SELECT DISTINCT className, classTime, classDay FROM UserPreferences");

        if (preferences.length === 0) {
            logger.info("📅 No class preferences found.");
            return;
        }

        logger.info(`📅 Found ${preferences.length} unique class preferences`);

        preferences.forEach(({ className, classTime, classDay }) => {
            // Convert stored class time and add 1 hour for booking time
            const fullDateTime = `1970-01-01 ${classTime}`; // Attach a dummy date
            const parsedTime = dayjs(fullDateTime, "YYYY-MM-DD HH:mm:ss");


            if (!parsedTime.isValid()) {
                logger.error(`❌ Invalid classTime detected: ${classTime}`);
                return;
            }
            const bookingTime = dayjs(parsedTime, "HH:mm:ss").add(1, "hour");
            const bookingHour = bookingTime.hour();
            const bookingMinute = bookingTime.minute();
           
            // Get mapped day index
            const scheduledDay = dayMapping[classDay];
            if (scheduledDay === undefined) {
                logger.error(`❌ Invalid day detected: ${classDay}`);
                return;
            }

            logger.info(`⏳ Scheduling ${className} booking on ${classDay} at ${bookingHour}:${bookingMinute}`);
          
            // Schedule the job exactly 7 days in advance
            schedule.scheduleJob(
                { hour: bookingHour, minute: bookingMinute, dayOfWeek: scheduledDay },
                () => {
                    logger.info(`📅 Running automated booking for ${className} at ${classTime} (7 days ahead)`);
                    automateClassBooking(className, classTime, classDay);
                }
            );
        });
    } catch (error) {
        logger.error("❌ Error scheduling class bookings:", error);
    }
};

// Run the function to set up scheduled jobs
// scheduleBookings();

module.exports = {scheduleBookings};