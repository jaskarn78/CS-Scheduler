/**
 * Formats a given date string into the desired format.
 *
 * @param {string} dateString - The input date string (supports "YYYY-MM-DD" and "MM/DD/YYYY").
 * @param {string} format - The desired output format (default: "MM/DD/YYYY").
 * @param {boolean} padStart - Whether to pad single-digit months/days with a zero (default: true).
 * @param {boolean} includeTime - Whether to include time (default: false).
 * @returns {string | null} - Formatted date or null if invalid.
 */
const formatDate = (dateString, format = "MM/DD/YYYY", padStart = true, includeTime = false) => {
    if (!dateString) return null; // Handle empty input

    let year, month, day, timePart = "";
    let isAM = (dateString).match(/AM|am/i);

    // Detect format and extract values
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        // ✅ Input format: "YYYY-MM-DD"
        [year, month, day] = dateString.split("-").map(num => parseInt(num, 10));
        if (includeTime) {
            timePart = dateString.split(" ")[1] || "";
        }
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
        // ✅ Input format: "MM/DD/YYYY"
        [month, day, year] = dateString.split("/").map(num => parseInt(num, 10));
        if (includeTime) {
            timePart = dateString.split(" ")[1] || "";
        }
    } else {
        console.error(`❌ Invalid date format: ${dateString}`);
        return null;
    }
    
    timePart = (isAM) ? timePart+" AM" : timePart+" PM"; // Convert to AM/PM format 

    // Ensure valid numbers
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
        console.error(`❌ Invalid numeric values in date: ${dateString}`);
        return null;
    }

    // ✅ Create UTC date object to prevent timezone shifts
    const date = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(date.getTime())) {
        console.error(`❌ Invalid date: ${dateString}`);
        return null;
    }

    // Format output based on the requested format
    const formattedMonth = padStart ? String(date.getUTCMonth() + 1).padStart(2, "0") : date.getUTCMonth() + 1;
    const formattedDay = padStart ? String(date.getUTCDate()).padStart(2, "0") : date.getUTCDate();
    const formattedYear = date.getUTCFullYear();

    let formattedDate = "";
    switch (format.toUpperCase()) {
        case "YYYY-MM-DD":
            formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
            break;
        case "MM/DD/YYYY":
            formattedDate = `${formattedMonth}/${formattedDay}/${formattedYear}`;
            break;
        case "MM-DD-YYYY":
            formattedDate = `${formattedMonth}-${formattedDay}-${formattedYear}`;
            break;
        case "DD/MM/YYYY":
            formattedDate = `${formattedDay}/${formattedMonth}/${formattedYear}`;
            break;
        default:
            console.error(`❌ Unsupported format: ${format}`);
            return null;
    }
    return includeTime ? `${formattedDate} ${timePart}`.trim() : formattedDate;
};
const convertTo12HourFormat = (timeStr) => {
    if(timeStr.includes("AM") || timeStr.includes("PM")) {
        return timeStr;
    }
    const [hour, minute, second] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert 0 or 12 to 12

    return `${formattedHour}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")} ${period}`;
};

const convertTo24HourFormat = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") {
        console.error("Invalid time string:", timeStr);
        return null; // Return null to indicate an invalid input
    }

    const timeParts = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i);

    if (!timeParts) {
        console.error("Invalid time format:", timeStr);
        return null; // Return null for invalid format
    }

    let [, hour, minute, second = "00", period] = timeParts;
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);
    second = parseInt(second, 10);

    if (period) {
        // Convert PM to 24-hour format (except for 12 PM which stays the same)
        if (period.toUpperCase() === "PM" && hour !== 12) {
            hour += 12;
        }
        // Convert 12 AM to 00 hours (midnight)
        if (period.toUpperCase() === "AM" && hour === 12) {
            hour = 0;
        }
    }

    // Ensure all values are two-digit formatted
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    const formattedSecond = second.toString().padStart(2, "0");

    return `${formattedHour}:${formattedMinute}:${formattedSecond}`;
};
module.exports = { formatDate, convertTo12HourFormat, convertTo24HourFormat };