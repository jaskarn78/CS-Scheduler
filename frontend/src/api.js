// Determine the API base URL dynamically based on the environment
const API_BASE_URL = 
    process.env.NODE_ENV === "development"
        ? "http://192.168.7.200:3000/api" // Backend server during development
        : "/api"; // Use relative path for production

// Utility function to get the token from localStorage
const getAuthToken = () => localStorage.getItem("token");
// Function to get the stored authorization header
const getAuthorizationHeader = () => {
    return localStorage.getItem("authHeader") || null;
  };
const getBarcode = ()=>{
    return localStorage.getItem("barCode") || null;
}
const getUserID = ()=>{
    return localStorage.getItem("userID") || null;
}
// Utility function to format the date as mm-dd-yyyy
const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
};



const handleUnauthorized = () => {
    console.log('here');
    localStorage.removeItem("token");
    localStorage.removeItem("authHeader");
    localStorage.removeItem("barCode");
    localStorage.removeItem("userID");
    window.location.href = "/login"; // Redirect to login
};


export const getUserProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/profile/my-profile`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"token": getAuthToken(), "authHeader": getAuthorizationHeader(), "userID": getUserID(), "barCode": getBarcode()  }),
            credentials: "include" // Allow cookies and CORS authentication
        }
    );
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;

};

export const getUpcomingClasses = async (start) => {
    const response = await fetch(`${API_BASE_URL}/classes/classes-by-club`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"token": getAuthToken(),"authHeader": getAuthorizationHeader(),startDate:start }),
        credentials: "include" // Allow cookies and CORS authentication
    });
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;
};

export const getReservations = async () => {
    const response = await fetch(`${API_BASE_URL}/classes/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"token": getAuthToken(),"authHeader": getAuthorizationHeader()}),
        credentials: "include" // Allow cookies and CORS authentication
    });
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;
};

// Function to convert class time to ISO-like 24-hour format
const formatDateTime = (startDt) => {
    const [date, time, type] = startDt.split(" ");
    const formattedDate = formatDate(date); // Convert to mm-dd-yyyy
    const formattedTime = time; // Convert to HH:mm
    return `${formattedDate} ${formattedTime} ${type}`;
};

export const getBookingSpot = async (classID, startDt) => {
    const classDate = formatDateTime(startDt); // Use the 24-hour format
    const response = await fetch(`${API_BASE_URL}/booking/spot-booking-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classScheduleId: classID, classDate,token: getAuthToken(),"authHeader": getAuthorizationHeader() }),
    });
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;
};

export const reserveSpot = async (classID, classTime, spotID, barCode) => {
    const classDate = formatDateTime(classTime); // Use the 24-hour format
    const response = await fetch(`${API_BASE_URL}/booking/reserve-class`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ClassSchedulesID: classID, classTime: classDate, bookedSpotID: spotID, token: getAuthToken(),"authHeader": getAuthorizationHeader(), barCode: getBarcode()}),
    });
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;
};

export const addToWaitList = async (classID, classTime) => {
    const classDate = formatDateTime(classTime); // Use the 24-hour format
    const response = await fetch(`${API_BASE_URL}/booking/addToWaitList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ClassSchedulesID: classID, classTime: classDate,token: getAuthToken(),"authHeader": getAuthorizationHeader() }),
        credentials: "include" // Allow cookies and CORS authentication
    });
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;
};


export const removeFromWaitList = async (waitListID, classTime) => {
    const classDate = formatDateTime(classTime); // Use the 24-hour format
    const response = await fetch(`${API_BASE_URL}/booking/addToWaitList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitListID: waitListID, classTime:classTime, barCode: getBarcode(), token: getAuthToken(),"authHeader": getAuthorizationHeader() }),
        credentials: "include" // Allow cookies and CORS authentication
    });
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;
};

export const cancelReservation = async (reservationID, trainingID) => {
    const response = await fetch(`${API_BASE_URL}/booking/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ClassReservationID: reservationID, TrainingAppointmentID: trainingID, token: getAuthToken(),"authHeader": getAuthorizationHeader() }),
        credentials: "include" // Allow cookies and CORS authentication
    });
    const data = await response.json();
    if(!data.Success){
        await handleUnauthorized();
    }
    return data;
};

export const saveUserPreferences = async (preferences) => {
    const response = await fetch("/api/preferences/savePreferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userID: localStorage.getItem("userID"),
            preferences, // Send as an array
        }),
    });
    return response.json();
};

export const getUserPreferences = async () => {
    const response = await fetch(`/api/preferences/getPreferences/`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: localStorage.getItem("userID") }),
    });
    return response.json();
};

export const deleteUserPreference = async (preferenceId, className, classTime) => {
    const response = await fetch(`/api/preferences/deletePreference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("userID"), preferenceId: preferenceId, className:className, classTime:classTime }),
    });
    return response.json();
};