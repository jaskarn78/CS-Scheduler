import React, { useState, useEffect } from "react";
import { getUpcomingClasses, getBookingSpot, reserveSpot, addToWaitList } from "../api";
import { classIcons, getClassCategory } from "../utils/classIconUtils";


const UpcomingClassesPage = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [availableSpots, setAvailableSpots] = useState([]);
    const [selectedSpot, setSelectedSpot] = useState("");
    const [selectedClassType, setSelectedClassType] = useState("All");

    useEffect(() => {
        setFilteredClasses(
            selectedClassType === "All" ? classes : classes.filter((cls) => cls.className === selectedClassType)
        );
    }, [selectedClassType, classes]);

    const handleDateChange = (event) => setSelectedDate(event.target.value);

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

    const handleCardClick = async (classItem) => {
        if (classItem.classStatusLabel === "Waitlist") {
            setModalContent({
                classType: classItem.className,
                classScheduleId: classItem.CLASS_SCHEDULES_ID,
                classTime: classItem.START_TIME,
                instructor: classItem.InstructorName,
                description: classItem.classDesc,
                waitlisted: true,
            });
            setIsModalOpen(true);
        } else {
            try {
                const response = await getBookingSpot(classItem.CLASS_SCHEDULES_ID, classItem.START_TIME);
                if (response.Success) {
                    const availableSpotNumbers = response.Value.Items
                        .filter((spot) => spot.Available && parseInt(spot.Text, 10) > 0)
                        .sort((a, b) => parseInt(a.Text) - parseInt(b.Text));

                    setAvailableSpots(availableSpotNumbers);
                    setModalContent({
                        classType: classItem.className,
                        classScheduleId: classItem.CLASS_SCHEDULES_ID,
                        classTime: classItem.START_TIME,
                        instructor: classItem.InstructorName,
                        description: classItem.classDesc,
                        waitlisted: false,
                    });

                    setSelectedSpot("");
                    setIsModalOpen(true);
                } else {
                    setModalContent({ error: "Failed to load booking spot details." });
                    setIsModalOpen(true);
                }
            } catch (err) {
                console.error("Error fetching booking spot details:", err);
                setModalContent({ error: "An error occurred while fetching spot details." });
                setIsModalOpen(true);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setAvailableSpots([]);
    };

    const handleSpotChange = (event) => setSelectedSpot(event.target.value);

    const handleBookClass = async () => {
        if (!selectedSpot) return alert("Please select a spot to book the class.");

        try {
            const response = await reserveSpot(modalContent.classScheduleId, modalContent.classTime, selectedSpot);
            if (response.Success) {
                alert(response.Message || "Class booked successfully!");
                closeModal();
                //window.location.reload();
            } else {
                alert("Failed to book the class. Please try again.");
            }
        } catch (err) {
            console.error("Error booking the class:", err);
            alert("An error occurred while booking the class. Please try again.");
        }
    };

    const handleAddToWaitlist = async () => {
        try {
            const response = await addToWaitList(modalContent.classScheduleId, modalContent.classTime);
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
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-center text-3xl font-semibold text-gray-900">Upcoming Classes</h1>

            <div className="flex flex-wrap gap-4 mt-6 justify-center">
                <input type="date" value={selectedDate} onChange={handleDateChange} className="border p-3 rounded-lg w-48" />
                <button
                    onClick={fetchClasses}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    disabled={!selectedDate}
                >
                    Get Classes
                </button>
                <select
                    className="border p-3 rounded-lg"
                    value={selectedClassType}
                    onChange={(e) => setSelectedClassType(e.target.value)}
                >
                    <option value="All">All Classes</option>
                    {[...new Set(classes.map((cls) => cls.className))].map((className) => (
                        <option key={className} value={className}>
                            {className}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            <div className="mt-6 space-y-4">
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((classItem) => {
                        const classCategory = getClassCategory(classItem.className);
                        const classIcon = classIcons[classCategory];

                        return (
                            <div
                                key={classItem.CLASS_SCHEDULES_ID}
                                className="border rounded-lg p-4 shadow-md bg-white cursor-pointer hover:shadow-lg transition"
                            >
                                {/* Class Name with Icon */}
                                <div className="flex items-center gap-3">
                                    {classIcon}
                                    <h2 className="text-xl font-semibold text-gray-800">{classItem.className}</h2>
                                </div>
                                <p className="text-gray-600"><strong>Instructor:</strong> {classItem.InstructorName}</p>
                                <p className="text-gray-600"><strong>Class Time:</strong> {classItem.START_TIME}</p>
                                <p className="text-gray-600"><strong>Status:</strong> {classItem.classStatusLabel === "Book" ? "Open" : classItem.classStatusLabel}</p>

                                <div className="flex flex-wrap gap-3 mt-4">
                                    {classItem.classStatusLabel === "Edit" ? (
                                        <button className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">
                                            Already Scheduled
                                        </button>
                                    ) : classItem.classStatusLabel.includes("Waitlist") ? (
                                        <button
                                            onClick={() => handleCardClick(classItem)}
                                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                                        >
                                            Join Waitlist
                                        </button>
                                    ) : classItem.classStatusLabel === "Book" ? (
                                        <button
                                            onClick={() => handleCardClick(classItem)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                        >
                                            Book Now
                                        </button>
                                    ) : (
                                        <button onClick={()=> handleCardClick(classItem)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                           Prepare to book
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500">No classes available for the selected date.</p>
                )}
            </div>

            {isModalOpen && modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                        {/* Modal Header with Icon */}
                        <div className="flex items-center gap-3">
                            {classIcons[getClassCategory(modalContent.classType)]}
                            <h2 className="text-2xl font-bold text-gray-800">{modalContent.classType}</h2>
                        </div>

                        <p className="text-gray-700"><strong>Instructor:</strong> {modalContent.instructor}</p>
                        <p className="text-gray-700"><strong>Class Time:</strong> {modalContent.classTime}</p>
                        <p className="text-gray-700"><strong>Description:</strong> {modalContent.description}</p>

                        {!modalContent.waitlisted && (
                            <div className="mt-4">
                                <label className="block text-gray-700 font-medium">Select a Spot:</label>
                                <select
                                    value={selectedSpot}
                                    onChange={handleSpotChange}
                                    className="w-full border p-2 rounded-lg mt-2"
                                >
                                    <option value="">Select a Spot</option>
                                    {availableSpots.map((spot) => (
                                        <option key={spot.Id} value={spot.Id}>{spot.Text}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded-lg">Close</button>
                            {modalContent.waitlisted ? (
                                <button onClick={handleAddToWaitlist} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
                                    Waitlist
                                </button>
                            ) : (
                                <button onClick={handleBookClass} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                                    Book
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingClassesPage;