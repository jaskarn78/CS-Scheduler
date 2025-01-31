import React, { useState } from "react";
import { getUpcomingClasses } from "../api";

const UpcomingClassesPage = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const fetchClasses = async () => {
        try {
            const response = await getUpcomingClasses(selectedDate);
            if (response.Success) {
                setClasses(response.Value);
                setError("");
            } else {
                setError("Failed to fetch classes. Please try again.");
            }
        } catch (err) {
            setError("An error occurred while fetching classes.");
            console.error(err);
        }
    };

    // Function to determine class type
   // Function to determine class type
const getClassType = (classItem) => {
    if (classItem.UiCategoryId === 14 && classItem.RoomTemplateID === 397) {
        return "CS4 Class";
    } else if (classItem.UiCategoryId === 15 && classItem.RoomTemplateID === 405) {
        return "Yoga Sculpt";
    } else if (classItem.UiCategoryId === 15 && classItem.RoomTemplateID === 403) {
        return "Yoga Restore";
    } else if (classItem.UiCategoryId === 33 && classItem.RoomTemplateID === 407) {
        return "Ride";
    } else if (classItem.UiCategoryId === 13 && classItem.RoomTemplateID === 408) {
        return "Reform";
    } else if (classItem.UiCategoryId === 32 && classItem.RoomTemplateID === 406) {
        return "Hot Pilates";
    } else if (classItem.UiCategoryId === 30 && classItem.RoomTemplateID === 400) {
        return "Box";
    } else if (classItem.UiCategoryId === 15 && classItem.RoomTemplateID===401) {
        return "Yoga Flow";
    } else if (classItem.UiCategoryId === 32) {
        return "Rebound";
    } else {
        return "General Class";
    }
};

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", color: "#007bff" }}>Upcoming Classes</h1>
            <label htmlFor="date-picker">Select a Date:</label>
            <input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                style={{
                    marginLeft: "10px",
                    padding: "5px",
                    fontSize: "16px",
                }}
            />
            <button
                onClick={fetchClasses}
                style={{
                    marginLeft: "10px",
                    padding: "5px 10px",
                    fontSize: "16px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
                disabled={!selectedDate}
            >
                Get Classes
            </button>

            {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

            <div style={{ marginTop: "20px" }}>
                {classes.length > 0 ? (
                    <div style={{ marginTop: "20px" }}>
                    {classes.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            {classes.map((classItem) => {
                                const classType = getClassType(classItem);
                                console.log(classItem);
                                return (
                                    <div
                                        key={classItem.CLASS_SCHEDULES_ID}
                                        style={{
                                            border: "1px solid #ddd",
                                            borderRadius: "8px",
                                            padding: "15px",
                                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                            backgroundColor: "#fff",
                                        }}
                                    >
                                        <h2 style={{ margin: "0 0 10px", color: "#007bff" }}>{classType}</h2>
                                        <p>
                                            <strong>Instructor:</strong>{" "}
                                            {classItem.Instructor || "TBD"}
                                        </p>
                                        <p>
                                            <strong>Class Time:</strong>{" "}
                                            {selectedDate
                                                ? new Date(selectedDate).toUTCString()
                                                : "N/A"}
                                        </p>
                                        <p>
                                            <strong>Spot Number:</strong>{" "}
                                            {classItem.SpotDisplayNumber}
                                        </p>
                                        <p>
                                            <strong>Available Spots:</strong>{" "}
                                            {classItem.AvailableCapacity}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ textAlign: "center", color: "#666" }}>
                            No classes available for the selected date.
                        </p>
                    )}
                </div>
                ) : (
                    <p style={{ textAlign: "center", color: "#666" }}>
                        No classes available for the selected date.
                    </p>
                )}
            </div>
        </div>
    );
};

export default UpcomingClassesPage;