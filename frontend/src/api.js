const API_BASE_URL = "/api";

// Utility function to format the date as mm-dd-yyyy
const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
};
export const getUserProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/profile/my-profile`);
    return response.json();
};

export const getUpcomingClasses = async (start) => {
    const response = await fetch(`${API_BASE_URL}/classes/classes-by-club`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: start })
    });
    return response.json();
};
export const getReservations = async()=>{
    const response = await fetch(`${API_BASE_URL}/classes/reservations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return response.json();
};
export const getBookingSpot = async(classID, startDt)=>{
    const dt = formatDate(startDt);
    const response = await fetch(`${API_BASE_URL}/booking/spot-booking-data`,{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({classScheduleId: classID, classDate: dt+" 07:30"})
    });
    return response.json();
}