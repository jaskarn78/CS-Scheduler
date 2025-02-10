import React, { useState } from "react";
import { getUpcomingClasses, getBookingSpot, reserveSpot, addToWaitList } from "../api";

const UpcomingClassesPage = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [availableSpots, setAvailableSpots] = useState([]);
    const [selectedSpot, setSelectedSpot] = useState("");
    const [roomName, setRoomName] = useState("");

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const fetchClasses = async () => {
        try {
            const response = await getUpcomingClasses(selectedDate);
            if (response.Success) {
                setClasses(response.Value); // Use backend-provided data directly
                setError("");
            } else {
                setError("Failed to fetch classes. Please try again.");
            }
        } catch (err) {
            setError("An error occurred while fetching classes.");
            console.error(err);
        }
    };

    const handleCardClick = async (classItem) => {
        if (classItem.classStatusLabel === "Waitlist") {
            setModalContent({
                classType: classItem.className,
                classScheduleId: classItem.CLASS_SCHEDULES_ID,
                classTime: classItem.START_TIME,
                instructor: classItem.InstructorName,
                description: classItem.classDesc,
                category: classItem.category,
                rules: classItem.brandGuideLines,
                waitlisted: true,
            });
            setIsModalOpen(true);
        } else {
            try {
                const response = await getBookingSpot(classItem.CLASS_SCHEDULES_ID, classItem.START_TIME);
                if (response.Success) {
                    const availableSpotNumbers = response.Value.Items.filter(
                        (spot) => spot.Available && parseInt(spot.Text, 10) !== -1
                    )
                        .map((spot) => spot)
                        .sort((a, b) => parseInt(a.Text) - parseInt(b.Text));

                    setAvailableSpots(availableSpotNumbers);
                    setRoomName(response.Value.RoomLayout.RoomName || "Unknown Room");

                    setModalContent({
                        classType: classItem.className,
                        classScheduleId: classItem.CLASS_SCHEDULES_ID,
                        classTime: classItem.START_TIME,
                        instructor: classItem.InstructorName,
                        description: classItem.classDesc,
                        category: classItem.category,
                        rules: classItem.brandGuideLines,
                        roomName: response.Value.RoomLayout.RoomName,
                        waitlisted: false,
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

    const handleBookClass = async (spotId, startTime, classScheduleId) => {
        if (!spotId) {
            alert("Please select a spot to book the class.");
            return;
        }

        try {
            const response = await reserveSpot(classScheduleId, startTime, spotId);

            if (response.Success) {
                alert(response.Message || "Class booked successfully!");
                closeModal();
                window.location.reload();
            } else {
                alert("Failed to book the class. Please try again.");
            }
        } catch (err) {
            console.error("Error booking the class:", err);
            alert("An error occurred while booking the class. Please try again.");
        }
    };

    const handleAddToWaitlist = async (classScheduleId, classTime) => {
        try {
            const response = await addToWaitList(classScheduleId, classTime);
            if (response.Success) {
                alert(response.Message || "Successfully added to the waitlist!");
                closeModal();
                window.location.reload();
            } else {
                alert("Failed to join the waitlist. Please try again.");
            }
        } catch (err) {
            console.error("Error adding to the waitlist:", err);
            alert("An error occurred while adding to the waitlist. Please try again.");
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {classes.map((classItem) => (
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
                                <h2 style={{ margin: "0 0 10px", color: "#007bff" }}>{classItem.className}</h2>
                                <div className='line-item'>
                                    <strong>Instructor:</strong> {classItem.InstructorTitle} {classItem.InstructorName}
                                </div>
                                <div className='line-item'>
                                    <strong>Class Status:</strong> {classItem.classStatusLabel}
                                </div>
                                <div className='line-item'>
                                    <strong>Class Time:</strong> {classItem.START_TIME}
                                </div>
                                {classItem.classStatusLabel !== "Waitlist" && (
                                    <div className='line-item'>
                                        <strong>Available Spots:</strong> {classItem.extra.AvailableCapacity}
                                    </div>
                                )}
                            </div>
                        ))}
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
                    <div className='hdr'>{modalContent.classType} </div>
                    <div className='line-item'>
                        {/* <strong>Room:</strong> {roomName != "" ? } */}
                    </div>
                    <div className='line-item'>
                        <strong>Instructor:</strong> {modalContent.instructor}
                    </div>
                    <div className='line-item'>
                        <strong>Class Time:</strong> {modalContent.classTime}
                    </div>
                    <div className='line-item'>
                        <strong>Description:</strong>{modalContent.description}
                    </div>

                    {!modalContent.waitlisted && (
                        <>
                            <label htmlFor="spot-selector">
                                <strong>Select a Spot:</strong>
                            </label>
                            <select
                                id="spot-selector"
                                value={selectedSpot}
                                onChange={handleSpotChange}
                                style={{
                                    margin: "10px 0",
                                    padding: "5px",
                                    fontSize: "16px",
                                    width: "100%",
                                }}
                            >
                                <option value="">Select a Spot</option>
                                {availableSpots.map((spot, index) => (
                                    <option key={index} value={spot.Id}>
                                        {spot.Text}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "20px",
                            width: "100%",
                        }}
                    >
                        <button
                            onClick={closeModal}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#f44336", // Red for Close
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                        {modalContent.waitlisted ? (
                            <button
                                onClick={() =>
                                    handleAddToWaitlist(modalContent.classScheduleId, modalContent.classTime)
                                }
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50", // Green for Waitlist
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                Waitlist
                            </button>
                        ) : (
                            <button
                                onClick={() =>
                                    handleBookClass(
                                        selectedSpot,
                                        modalContent.classTime,
                                        modalContent.classScheduleId
                                    )
                                }
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50", // Green for Book
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                                disabled={!selectedSpot}
                            >
                                Book
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    </div>
)}
        </div>
    );
};

export default UpcomingClassesPage;