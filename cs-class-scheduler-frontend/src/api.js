const API_BASE_URL = "/api";

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