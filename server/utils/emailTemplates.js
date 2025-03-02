const {convertTo12HourFormat} = require("../utils/dateTimeUtils");

// Function to retrieve the icon based on the class type
const classIcons = (env) => {
    const baseURL = env === "development"
        ? 'http://192.168.7.200:3000/images'
        : 'https://clubsync.app/images';
    return {
        "RIDE": `<img src="${baseURL}/stationary-bike.png" alt="Ride" style="width:24px; height:24px;" />`,
        "BOX": `<img src="${baseURL}/boxing-gloves.png" alt="Box" style="width:24px; height:24px;" />`,
        "CS4": `<img src="${baseURL}/gym.png" alt="CS4" style="width:24px; height:24px;" />`,
        "REFORM": `<img src="${baseURL}/reformer.png" alt="Reform" style="width:24px; height:24px;" />`, 
        "SWEAT+": `<img src="${baseURL}/yoga-mat.png" alt="Sweat+" style="width:24px; height:24px;" />`,
        "SPECIALTY": `<img src="${baseURL}/trampoline-jumping.png" alt="Specialty" style="width:24px; height:24px;" />`,
        "HOT PILATES": `<img src="${baseURL}/pilates.png" alt="Hot Pilates" style="width:24px; height:24px;" />`,
    }
};

// Function to categorize class types
const getClassCategory = (className) => {
    if (className.includes("YOGA")) return "SWEAT+";
    if (className.includes("REBOUND")) return "SPECIALTY";
    return className; // Use default if no match
};

/**
 * Generates an ICS file content for calendar integration
 * @param {string} className - Name of the class
 * @param {string} instructorName - Name of the instructor
 * @param {string} date - Date of the class
 * @param {string} time - Time of the class
 * @param {string} spotNumber - Spot number reserved
 * @returns {string} - ICS file content
 */
const generateICSContent = (className, instructorName = "Instructor", date, time, spotNumber = "N/A") => {
    // Create date objects for start and end times (45 min duration)
    const fullDate = `${date} ${time}`;
    const startDate = new Date(fullDate);
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);
    const timestamp = new Date();
    
    const formatToICS = (date) => 
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const dtStart = formatToICS(startDate);
    const dtEnd = formatToICS(endDate);
    const dtStamp = formatToICS(timestamp);
    
    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${className}
DTSTART:${dtStart}
DTEND:${dtEnd}
DTSTAMP:${dtStamp}
UID:${Date.now()}-${className.replace(/\s+/g, "")}
DESCRIPTION:Instructor: ${instructorName}\\nSpot: ${spotNumber}
LOCATION:Club Studio 7440 Elk Grove Blvd, Elk Grove, CA 95757
STATUS:CONFIRMED
PRIORITY:0
END:VEVENT
END:VCALENDAR`.replace(/\n/g, "\r\n");
};

/**
 * Generates a stylized HTML email template for booking confirmation with mobile-optimized design.
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @param {string} className - Class name.
 * @param {string} classTime - Scheduled class time.
 * @param {string} status - Booking status (Success/Failed).
 * @param {string} spotNumber - Reserved spot number.
 * @param {string} instructorName - Optional instructor name.
 * @returns {string} - Formatted HTML email.
 */
const generateEmailTemplate = (firstName, lastName, className, classTime, status, spotNumber = "N/A", instructorName = "") => {
    const env = process.env.NODE_ENV || "production"; // Default to production if not set
    const icons = classIcons(env);
    const classCategory = getClassCategory(className.toUpperCase());
    const classIcon = icons[classCategory.toUpperCase()] || `<span style="font-size:24px;">🏋️</span>`; // Default emoji if no icon is found
    
    // Parse date and time
    const dateTimeParts = classTime.split(" ");
    const date = dateTimeParts[0];
    const time = dateTimeParts[1];
    
    // Generate ICS file content for "Add to Calendar" functionality
    const icsContent = encodeURIComponent(generateICSContent(className, instructorName, date, time, spotNumber));
    
    // Format time to 12-hour format if function is available
    let displayTime = time;
    try {
        if (typeof convertTo12HourFormat === 'function') {
            displayTime = convertTo12HourFormat(time);
        }
    } catch (error) {
        console.log("Time conversion function not available, using original format");
    }
    
    // Determine status color and icon
    const statusColor = status === "Success" ? "#10b981" : "#ef4444";
    const statusIcon = status === "Success" ? "✅" : "❌";
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ClubSync Booking ${status === "Success" ? "Confirmed" : "Failed"}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 100%; background-color: #f9fafb;">
            <!-- Header with gradient background -->
            <div style="background: #4f46e5; padding: 25px 15px; text-align: center; color: white;">
                <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.9); border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin: 0 auto 15px auto;">
                    <div style="font-weight: bold; color: #4338ca; font-size: 24px;">CS</div>
                </div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">ClubSync</div>
                <div style="font-weight: 500; font-size: 18px;">Class Booking ${status === "Success" ? "Confirmed" : "Failed"}</div>
            </div>
            
            <!-- Main content -->
            <div style="background-color: white; padding: 15px; min-height: 200px;">
                <p style="font-size: 16px; color: #374151; margin-top: 0;">Hello <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Your booking request for the following class has been processed:</p>
                
                <!-- Class details card -->
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <!-- Class name with icon -->
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="font-size: 22px; font-weight: 600; color: #111827;">${className} ${classIcon}</div>
                    </div>
                    
                    <!-- Class details -->
                    <div>
                        <!-- Date -->
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <div style="min-width: 24px; text-align: center; margin-right: 10px;">📅</div>
                            <div style="color: #4b5563; flex-grow: 1;">Date: ${date}</div>
                        </div>
                        
                        <!-- Time -->
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <div style="min-width: 24px; text-align: center; margin-right: 10px;">⏰</div>
                            <div style="color: #4b5563; flex-grow: 1;">Time: ${displayTime}</div>
                        </div>
                        
                        <!-- Spot -->
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <div style="min-width: 24px; text-align: center; margin-right: 10px;">📍</div>
                            <div style="color: #4b5563; flex-grow: 1;">Spot: ${spotNumber}</div>
                        </div>
                        
                        <!-- Instructor if provided -->
                        ${instructorName ? `
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <div style="min-width: 24px; text-align: center; margin-right: 10px;">👤</div>
                            <div style="color: #4b5563; flex-grow: 1;">Coach: ${instructorName}</div>
                        </div>
                        ` : ''}
                        
                        <!-- Status -->
                        <div style="display: flex; align-items: center;">
                            <div style="min-width: 24px; text-align: center; margin-right: 10px;">${statusIcon}</div>
                            <div style="font-weight: 600; color: ${statusColor}; flex-grow: 1;">Status: ${status}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Action buttons -->
                <div style="text-align: center; margin-bottom: 20px;">
                    
                    <a href="https://clubsync.app" style="display: block; background-color: #4f46e5; color: white; padding: 12px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-bottom: 12px; width: 100%; box-sizing: border-box; text-align: center;">
                        View My Schedule
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 5px;">
                    If this booking was not expected, please check your preferences in the ClubSync app.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; background-color: #f9fafb;">
                &copy; 2025 ClubSync. All rights reserved.<br>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { generateEmailTemplate };