const {convertTo12HourFormat} = require("../utils/dateTimeUtils");
// Function to retrieve the icon based on the class type
const classIcons = (env)=>{
    const baseURL = env === "development"
    ? 'http://192.168.7.200:3000/images'
    : 'https://cs.jjagpal.me/images';
    return {
        "RIDE": `<img src="${baseURL}/stationary-bike.png" alt="Ride" style='width:2rem; height:2rem;' class="w-10 h-10 text-gray-700" />`,
        "BOX": `<img src="${baseURL}/boxing-gloves.png" alt="Box" style='width:2rem; height:2rem;' class="w-10 h-10 text-gray-700" />`,
        "CS4": `<img src="${baseURL}/gym.png" alt="CS4" style='width:2rem; height:2rem;' class="w-10 h-10 text-gray-700" />`,
        "REFORM": `<img src="${baseURL}/reformer.png" alt="Reform" style='width:2rem; height:2rem;' class="w-10 h-10 text-gray-700" />`, 
        "SWEAT+": `<img src="${baseURL}/yoga-mat.png" alt="Sweat+ style='width:2rem; height:2rem;'" class="w-10 h-10 text-gray-700" />`,
        "SPECIALTY": `<img src="${baseURL}/trampoline-jumping.png" style='width:2rem; height:2rem;' alt="Specialty" class="w-10 h-10 text-gray-700" />`,
        "HOT PILATES": `<img src="${baseURL}/pilates.png" alt="Hot Pilates" style='width:2rem; height:2rem;' class="w-10 h-10 text-gray-700" />`,
    }

};

// Function to categorize class types
const getClassCategory = (className) => {
    if (className.includes("YOGA")) return "SWEAT+";
    if (className.includes("REBOUND")) return "SPECIALTY";
    return className; // Use default if no match
};

/**
 * Generates a stylized HTML email template for booking confirmation.
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @param {string} className - Class name.
 * @param {string} classTime - Scheduled class time.
 * @param {string} status - Booking status (Success/Failed).
 * @param {string} spotNumber - Reserved spot number.
 * @returns {string} - Formatted HTML email.
 */
const generateEmailTemplate = (firstName, lastName, className, classTime, status, spotNumber = "N/A") => {
    const env = process.env.NODE_ENV || "production"; // Default to production if not set
    const icons = classIcons(env);
    const classCategory = getClassCategory(className);
    const classIcon = icons[classCategory] || "🏋️"; // Default emoji if no icon is found
    const logo = `<img src="${env === "development" ? "http://192.168.7.200:3000/images/cs-logo.png" : "https://cs.jjagpal.me/images/cs-logo.png"}" alt="Club Studio Logo" width="80">`;
    const dateTimeParts = classTime.split(" ");
    const date = dateTimeParts[0];
    const time = convertTo12HourFormat(dateTimeParts[1]);
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">
                ${logo}
                <h2 style="color:rgba(25, 26, 28, 0.75);">Class Booking ${status === "Success" ? "Confirmed" : "Failed"}</h2>
            </div>

            <p style="font-size: 16px;">Hello <strong>${firstName} ${lastName}</strong>,</p>
            <p style="font-size: 16px;">Your booking request for the following class has been processed:</p>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; text-align: center;">
    
                <p><strong>🏋️ Class:</strong> ${className} ${classIcon}</p>
                <p><strong>⏰ Date:</strong> ${date}</p>
                <p><strong>📅 Time:</strong> ${time}</p>
                <p><strong>📍 Spot Number:</strong> ${spotNumber}</p>
                <p><strong>📌 Status:</strong> 
                    <span style="color: ${status === "Success" ? "#28a745" : "#dc3545"}; font-weight: bold;">
                        ${status}
                    </span>
                </p>
            </div>

            <p style="font-size: 14px; margin-top: 20px;">If this was not expected, please check your preferences in the scheduler app.</p>

            <div style="text-align: center; margin-top: 20px;">
                <a href="https://cs.jjagpal.me" style="display: inline-block; padding: 10px 20px; background-color: rgba(0, 0, 0, 0.9); color: white; text-decoration: none; border-radius: 5px;">
                    View My Schedule
                </a>
            </div>

            <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
                Club Studio Scheduler | Manage your fitness bookings easily.
            </p>
        </div>
    `;
};



module.exports = { generateEmailTemplate };