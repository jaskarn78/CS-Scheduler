import React, { useState } from "react";
import { getUpcomingClasses, getBookingSpot } from "../api";

const UpcomingClassesPage = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [availableSpots, setAvailableSpots] = useState([]);
    const [selectedSpot, setSelectedSpot] = useState("");
    const [roomName, setRoomName] = useState("");

    // Sample extracted schedule data (replace with actual parsed data)
    const clubStudioSchedule = {
        Monday: [
            { "time": "5:05 AM", "class": "CS4", "instructor": "Kristin S." },
            { "time": "5:45 AM", "class": "Yoga Flow", "instructor": "Larraine R." },
            { "time": "6:00 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
            { "time": "6:05 AM", "class": "CS4", "instructor": "Kristin S." },
            { "time": "6:30 AM", "class": "Ride", "instructor": "Becca R." },
            { "time": "7:00 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
            { "time": "7:30 AM", "class": "CS4", "instructor": "Lisa T." },
            { "time": "8:00 AM", "class": "Reform", "instructor": "Sub: Diana T." },
            { "time": "8:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "8:30 AM", "class": "Yoga Sculpt", "instructor": "Allison L." },
            { "time": "9:00 AM", "class": "Reform", "instructor": "Diana T." },
            { "time": "9:15 AM", "class": "Box", "instructor": "Sean M." },
            { "time": "9:30 AM", "class": "CS4", "instructor": "Sergio G." },
            { "time": "10:00 AM", "class": "Reform", "instructor": "Diana T." },
            { "time": "10:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "10:30 AM", "class": "CS4", "instructor": "Kristin S." },
            { "time": "11:00 AM", "class": "Reform", "instructor": "Diana T." },
            { "time": "12:00 PM", "class": "Reform", "instructor": "Diana T." },
            { "time": "12:30 PM", "class": "CS4", "instructor": "Kristin S." },
            { "time": "1:00 PM", "class": "Reform", "instructor": "Diana T." },
            { "time": "4:00 PM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "4:30 PM", "class": "CS4", "instructor": "Samuel E." },
            { "time": "5:00 PM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "5:15 PM", "class": "Box", "instructor": "Sean M." },
            { "time": "5:15 PM", "class": "Yoga Sculpt", "instructor": "Carol V." },
            { "time": "5:30 PM", "class": "Ride", "instructor": "Alex H." },
            { "time": "5:30 PM", "class": "CS4", "instructor": "Samuel E." },
            { "time": "6:00 PM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "6:15 PM", "class": "Box", "instructor": "Sean M." },
            { "time": "6:30 PM", "class": "Yoga Restore", "instructor": "Carol V." },
            { "time": "6:30 PM", "class": "CS4", "instructor": "Samuel E." },
            { "time": "7:00 PM", "class": "Reform", "instructor": "Gisselle V." },
        ],
        Tuesday: [
            { "time": "5:05 AM", "class": "CS4", "instructor": "Kristin S." },
      { "time": "5:45 AM", "class": "Yoga Flow", "instructor": "Larraine R." },
      { "time": "6:00 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
      { "time": "6:05 AM", "class": "CS4", "instructor": "Kristin S." },
      { "time": "6:30 AM", "class": "Ride", "instructor": "Becca R." },
      { "time": "7:00 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
      { "time": "7:30 AM", "class": "CS4", "instructor": "Lisa T." },
      { "time": "8:00 AM", "class": "Reform", "instructor": "Sub: Diana T." },
      { "time": "8:15 AM", "class": "Box", "instructor": "Sergio G." },
      { "time": "8:30 AM", "class": "Yoga Sculpt", "instructor": "Allison L." },
      { "time": "9:00 AM", "class": "Reform", "instructor": "Diana T." },
      { "time": "9:15 AM", "class": "Box", "instructor": "Sean M." },
      { "time": "9:30 AM", "class": "CS4", "instructor": "Sergio G." },
      { "time": "10:00 AM", "class": "Reform", "instructor": "Diana T." },
      { "time": "10:15 AM", "class": "Box", "instructor": "Sergio G." },
      { "time": "10:30 AM", "class": "CS4", "instructor": "Kristin S." },
      { "time": "11:00 AM", "class": "Reform", "instructor": "Diana T." },
      { "time": "12:00 PM", "class": "Reform", "instructor": "Diana T." },
      { "time": "12:30 PM", "class": "CS4", "instructor": "Kristin S." },
      { "time": "1:00 PM", "class": "Reform", "instructor": "Diana T." },
      { "time": "4:00 PM", "class": "Reform", "instructor": "Gisselle V." },
      { "time": "4:30 PM", "class": "CS4", "instructor": "Samuel E." },
      { "time": "5:00 PM", "class": "Reform", "instructor": "Gisselle V." },
      { "time": "5:15 PM", "class": "Box", "instructor": "Sean M." },
      { "time": "5:15 PM", "class": "Yoga Sculpt", "instructor": "Carol V." },
      { "time": "5:30 PM", "class": "Ride", "instructor": "Alex H." },
      { "time": "5:30 PM", "class": "CS4", "instructor": "Samuel E." },
      { "time": "6:00 PM", "class": "Reform", "instructor": "Gisselle V." },
      { "time": "6:15 PM", "class": "Box", "instructor": "Sean M." },
      { "time": "6:30 PM", "class": "Yoga Restore", "instructor": "Carol V." },
      { "time": "6:30 PM", "class": "CS4", "instructor": "Samuel E." },
      { "time": "7:00 PM", "class": "Reform", "instructor": "Gisselle V." },
        ],
        Wednesday:[
            { "time": "5:05 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "5:10 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
            { "time": "5:45 AM", "class": "Yoga Sculpt", "instructor": "Charlotte C." },
            { "time": "6:05 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "6:05 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
            { "time": "6:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "7:00 AM", "class": "Ride", "instructor": "Hannah Z." },
            { "time": "7:00 AM", "class": "Yoga Sculpt", "instructor": "Charlotte C." },
            { "time": "7:00 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
            { "time": "8:00 AM", "class": "Reform", "instructor": "Sub: Diana T." },
            { "time": "8:15 AM", "class": "Rebound", "instructor": "Hannah Z." },
            { "time": "9:00 AM", "class": "Reform", "instructor": "Diana T." },
            { "time": "9:15 AM", "class": "Box", "instructor": "Kristin S." },
            { "time": "9:30 AM", "class": "Ride", "instructor": "Karlyn C." },
            { "time": "9:30 AM", "class": "CS4", "instructor": "Sergio G." },
            { "time": "9:30 AM", "class": "Hot Pilates", "instructor": "Elise E." },
            { "time": "10:00 AM", "class": "Reform", "instructor": "Diana T." },
            { "time": "10:15 AM", "class": "Box", "instructor": "Kristin S." },
            { "time": "10:30 AM", "class": "CS4", "instructor": "Sergio G." },
            { "time": "11:00 AM", "class": "Reform", "instructor": "Diana T." },
            { "time": "12:00 PM", "class": "Reform", "instructor": "Diana T." },
            { "time": "12:15 AM", "class": "Box", "instructor": "Sean M." },
            { "time": "12:30 PM", "class": "CS4", "instructor": "Sergio G." },
            { "time": "1:00 PM", "class": "Reform", "instructor": "Diana T." },
            { "time": "4:00 PM", "class": "Yoga Restore", "instructor": "Leslie S." },
            { "time": "4:00 PM", "class": "Reform", "instructor": "Diana T." },
            { "time": "4:30 PM", "class": "CS4", "instructor": "Kenneth A." },
            { "time": "5:00 PM", "class": "Reform", "instructor": "Diana T." },
            { "time": "5:15 PM", "class": "Box", "instructor": "Samuel E." },
            { "time": "5:15 PM", "class": "Hot Pilates", "instructor": "Carol V." },
            { "time": "5:30 PM", "class": "CS4", "instructor": "Kenneth A." },
            { "time": "6:00 PM", "class": "Reform", "instructor": "Diana T." },
            { "time": "6:15 PM", "class": "Box", "instructor": "Samuel E." },
            { "time": "6:30 PM", "class": "Ride", "instructor": "Alex H." },
            { "time": "6:30 PM", "class": "Yoga Flow", "instructor": "Lia H." },
            { "time": "6:30 PM", "class": "CS4", "instructor": "Kenneth A." },
            { "time": "7:00 PM", "class": "Reform", "instructor": "Diana T." }
        ],
        Thursday:[
            { "time": "5:05 AM", "class": "CS4", "instructor": "Kristin S." },
            { "time": "5:45 AM", "class": "Hot Pilates", "instructor": "Pearl P." },
            { "time": "6:00 AM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "6:05 AM", "class": "CS4", "instructor": "Kristin S." },
            { "time": "6:30 AM", "class": "Ride", "instructor": "Becca R." },
            { "time": "7:00 AM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "7:00 AM", "class": "Hot Pilates", "instructor": "Pearl P." },
            { "time": "7:30 AM", "class": "CS4", "instructor": "Lisa T." },
            { "time": "8:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "8:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "9:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "9:15 AM", "class": "Yoga Flow", "instructor": "Allison L." },
            { "time": "9:30 AM", "class": "CS4", "instructor": "Sergio G." },
            { "time": "9:30 AM", "class": "Hot Pilates", "instructor": "Elise E." },
            { "time": "10:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "10:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "10:30 AM", "class": "CS4", "instructor": "Sergio G." },
            { "time": "11:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "12:00 PM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "12:30 PM", "class": "CS4", "instructor": "Kristin S." },
            { "time": "4:00 PM", "class": "Yoga Sculpt", "instructor": "Leslie S." },
            { "time": "4:30 PM", "class": "CS4", "instructor": "Samuel E." },
            { "time": "5:00 PM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "5:15 PM", "class": "Yoga Flow", "instructor": "Coral S." },
            { "time": "5:30 PM", "class": "Ride", "instructor": "Sub: Catherine M." },
            { "time": "5:30 PM", "class": "CS4", "instructor": "Samuel E." },
            { "time": "6:00 PM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "6:15 PM", "class": "Box", "instructor": "Jacob S." },
            { "time": "6:30 PM", "class": "Yoga Restore", "instructor": "Lia H." },
            { "time": "6:30 PM", "class": "CS4", "instructor": "Samuel E." },
            { "time": "7:00 PM", "class": "Reform", "instructor": "Gisselle V." }
        ],
        Friday:[
            { "time": "5:05 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "5:10 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
            { "time": "5:45 AM", "class": "Yoga Sculpt", "instructor": "Charlotte C." },
            { "time": "6:05 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "6:05 AM", "class": "Reform", "instructor": "Sub: Brianna G." },
            { "time": "6:15 AM", "class": "Box", "instructor": "Sean M." },
            { "time": "7:00 AM", "class": "Rebound", "instructor": "Sub: Hannah Z." },
            { "time": "7:00 AM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "7:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "8:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "8:00 AM", "class": "Hot Pilates", "instructor": "Carol V." },
            { "time": "8:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "8:15 AM", "class": "Ride", "instructor": "Alex H." },
            { "time": "8:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "9:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "9:15 AM", "class": "Yoga Sculpt", "instructor": "Allison L." },
            { "time": "9:30 AM", "class": "Ride", "instructor": "Catherine M." },
            { "time": "9:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "10:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "10:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "10:30 AM", "class": "Yoga Restore", "instructor": "Allison L." },
            { "time": "10:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "11:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "11:45 AM", "class": "Yoga Flow", "instructor": "Sub: Allison L." },
            { "time": "12:00 PM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "12:15 PM", "class": "Box", "instructor": "Sean M." },
            { "time": "12:30 PM", "class": "CS4", "instructor": "Samuel E." },
            { "time": "4:30 PM", "class": "Yoga Flow", "instructor": "Charlotte C." }
        ],
        Saturday:[
            { "time": "5:05 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "5:10 AM", "class": "Reform", "instructor": "Kathy K." },
            { "time": "5:45 AM", "class": "Yoga Flow", "instructor": "Jeannie S." },
            { "time": "6:05 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "6:05 AM", "class": "Reform", "instructor": "Kathy K." },
            { "time": "6:15 AM", "class": "Box", "instructor": "Sean M." },
            { "time": "7:00 AM", "class": "Rebound", "instructor": "Sub: Hannah Z." },
            { "time": "7:00 AM", "class": "Reform", "instructor": "Gisselle V." },
            { "time": "7:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "8:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "8:00 AM", "class": "Hot Pilates", "instructor": "Carol V." },
            { "time": "8:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "8:15 AM", "class": "Ride", "instructor": "Alex H." },
            { "time": "8:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "9:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "9:15 AM", "class": "Yoga Sculpt", "instructor": "Allison L." },
            { "time": "9:30 AM", "class": "Ride", "instructor": "Catherine M." },
            { "time": "9:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "10:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "10:15 AM", "class": "Box", "instructor": "Sergio G." },
            { "time": "10:30 AM", "class": "Yoga Restore", "instructor": "Allison L." },
            { "time": "10:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "11:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "11:45 AM", "class": "Yoga Flow", "instructor": "Sub: Allison L." }
        ],
        Sundary:[
            { "time": "7:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "8:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "8:00 AM", "class": "Hot Pilates", "instructor": "Elise E." },
            { "time": "8:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "9:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "9:15 AM", "class": "Box", "instructor": "Jacob S." },
            { "time": "9:15 AM", "class": "Yoga Restore", "instructor": "Coral S." },
            { "time": "9:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "10:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "10:15 AM", "class": "Box", "instructor": "Kenneth A." },
            { "time": "10:30 AM", "class": "Yoga Flow", "instructor": "Allison L." },
            { "time": "10:30 AM", "class": "CS4", "instructor": "Torre P." },
            { "time": "11:00 AM", "class": "Reform", "instructor": "Brianna G." },
            { "time": "11:15 AM", "class": "Box", "instructor": "Kenneth A." }
        ]
        // Add entries for all days...
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const fetchClasses = async () => {
        try {
            const response = await getUpcomingClasses(selectedDate);
            if (response.Success) {
                const mappedClasses = mapClassDetails(selectedDate, response.Value)
                setClasses(mappedClasses);
                setError("");
            } else {
                setError("Failed to fetch classes. Please try again.");
            }
        } catch (err) {
            setError("An error occurred while fetching classes.");
            console.error(err);
        }
    };
     // Function to get the weekday from the selected date
     const getWeekday = (dateString) => {
        // Split date into components manually to avoid timezone shift
        const [year, month, day] = dateString.split("-").map(Number);
        
        // Create a new Date object using local time (ensuring no unintended UTC conversion)
        const date = new Date(year, month - 1, day); // month is 0-indexed in JS Dates
    
        return date.toLocaleDateString("en-US", { weekday: "long" });
    };

    // Function to map API classes to schedule data
    const mapClassDetails = (date, apiClasses) => {
        const weekday = getWeekday(date);
        const scheduleForDay = clubStudioSchedule[weekday] || [];
        console.log(weekday);
        return apiClasses.map((classItem, index) => {
            const scheduleClass = scheduleForDay[index] || {}; // Match by index
            const detectedClassType = getClassType(classItem); // Determine type from API data
    
            return {
                ...classItem,
                classType: detectedClassType || "General Class",
                instructor: scheduleClass.instructor || "TBD",
                classTime: scheduleClass.time || "N/A",
            };
        });
    };
    const handleCardClick = async (classItem) => {
        try {
            const response = await getBookingSpot(classItem.CLASS_SCHEDULES_ID, selectedDate);
            if (response.Success) {
                const availableSpotNumbers = response.Value.Items.filter(
                    (spot) => spot.Available
                ).map((spot) => spot.Text);

                setAvailableSpots(availableSpotNumbers);
                setRoomName(response.Value.RoomLayout.RoomName || "Unknown Room");
                setModalContent({
                    classType: getClassType(classItem),
                    classTime: classItem.ReserveDate
                        ? new Date(classItem.ReserveDate).toLocaleString()
                        : "N/A",
                    instructor: classItem.Instructor || "TBD",
                });
                setSelectedSpot(""); // Reset selected spot
                setIsModalOpen(true);
            } else {
                setModalContent({
                    error: "Failed to load booking spot details.",
                });
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error("Error fetching booking spot details:", err);
            setModalContent({
                error: "An error occurred while fetching spot details.",
            });
            setIsModalOpen(true);
        }
    };
    
    const getClassType = (classItem) => {
        if (classItem.UiCategoryId === 14 && classItem.RoomTemplateID === 397) {
            return "CS4";
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
        } else if (classItem.UiCategoryId === 15 && classItem.RoomTemplateID === 401) {
            return "Yoga Flow";
        } else if (classItem.UiCategoryId === 32) {
            return "Rebound";
        } else {
            return "General Class";
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setAvailableSpots([]);
    };

    const handleSpotChange = (event) => {
        setSelectedSpot(event.target.value);
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {classes.map((classItem) => {
                            const classType = getClassType(classItem);
                            if(classItem.classType == "General Class"){
                            }

                            return (
                                <div
                                    key={classItem.CLASS_SCHEDULES_ID}
                                    onClick={() => handleCardClick(classItem)}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "15px",
                                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                        backgroundColor: "#fff",
                                        cursor: "pointer",
                                    }}
                                >
                                    <h2 style={{ margin: "0 0 10px", color: "#007bff" }}>{classType}</h2>
                                    <p>
                                        <strong>Instructor:</strong>{" "}
                                        {classItem.instructor || "TBD"}
                                    </p>
                                    <p>
                                        <strong>Class Time:</strong>{" "}
                                        {classItem.classTime || "N/A"}
                                    </p>
                                    <p>
                                        <strong>Available Spots:</strong> {classItem.AvailableCapacity}
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

            {isModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            width: "400px",
                            textAlign: "center",
                        }}
                    >
                        {modalContent ? (
                            <>
                                <h2>{modalContent.classType}</h2>
                                <p>
                                    <strong>Room:</strong> {roomName}
                                </p>
                                <p>
                                    <strong>Instructor:</strong> {modalContent.instructor}
                                </p>
                                <p>
                                    <strong>Class Time:</strong> {modalContent.classTime}
                                </p>
                                <label htmlFor="spot-selector">
                                    <strong>Select a Spot:</strong>
                                </label>
                                <select
                                    id="spot-selector"
                                    value={selectedSpot}
                                    onChange={handleSpotChange}
                                    style={{
                                        marginLeft: "10px",
                                        padding: "5px",
                                        fontSize: "16px",
                                    }}
                                >
                                    <option value="">Select a Spot</option>
                                    {availableSpots.map((spot, index) => (
                                        <option key={index} value={spot}>
                                            {spot}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <p>Loading...</p>
                        )}
                        <button
                            onClick={closeModal}
                            style={{
                                marginTop: "20px",
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingClassesPage;