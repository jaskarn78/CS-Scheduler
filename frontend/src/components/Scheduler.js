import React, { useState, useEffect } from "react";
import { getUpcomingClasses, getBookingSpot, reserveSpot, addToWaitList } from "../api";
import { classIcons, getClassCategory } from "../utils/classIconUtils";
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const UpcomingClassesPage = () => {
    // Initialize selectedDate with today's date in YYYY-MM-DD format
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [availableSpots, setAvailableSpots] = useState([]);
    const [selectedSpot, setSelectedSpot] = useState("");
    const [selectedClassType, setSelectedClassType] = useState("All"); // Class type filter
    const [selectedTimeFilter, setSelectedTimeFilter] = useState("All"); // Time filter

    // Fetch classes when selectedDate changes or on component mount
    useEffect(() => {
        fetchClasses();
    }, [selectedDate]);

    // Filter classes based on selectedClassType and selectedTimeFilter
    useEffect(() => {
        let filtered = selectedClassType === "All" ? classes : classes.filter((cls) => cls.className === selectedClassType);

        // Apply time filter
        if (selectedTimeFilter !== "All") {
            filtered = filtered.filter((cls) => {
                const classTime = new Date(cls.START_TIME).getHours();
                console.log(classTime, selectedTimeFilter);
                if (selectedTimeFilter === "Morning" && classTime >= 5 && classTime < 12) return true;
                if (selectedTimeFilter === "Afternoon" && classTime >= 12 && classTime < 17) return true;
                if (selectedTimeFilter === "Evening" && classTime >= 17 && classTime < 24) return true;
                return false;
            });
        }

        setFilteredClasses(filtered);
    }, [selectedClassType, classes, selectedTimeFilter]);

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

    // Handle previous day navigation
    const handlePreviousDay = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1); // Subtract one day
        setSelectedDate(currentDate.toISOString().split('T')[0]); // Update selectedDate
    };

    // Handle next day navigation
    const handleNextDay = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + 1); // Add one day
        setSelectedDate(currentDate.toISOString().split('T')[0]); // Update selectedDate
    };

    // Handle time filter selection
    const handleTimeFilter = (time) => {
        setSelectedTimeFilter(time);
    };

    // Handle class type filter selection
    const handleClassTypeFilter = (classType) => {
        setSelectedClassType(classType);
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
        <div className="min-h-screen bg-gray-50">
            {/* Date Selector */}
            <div className="p-4 bg-white border-b">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={handlePreviousDay}
                        className="p-2 hover:bg-gray-100 rounded-full appearance-none"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="font-medium bg-transparent"
                        />
                    </div>
                    <button
                        onClick={handleNextDay}
                        className="p-2 hover:bg-gray-100 rounded-full appearance-none"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Time slots quick select */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => handleTimeFilter("Morning")}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap appearance-none ${
                            selectedTimeFilter === "Morning"
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        Morning
                    </button>
                    <button
                        onClick={() => handleTimeFilter("Afternoon")}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap appearance-none ${
                            selectedTimeFilter === "Afternoon"
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        Afternoon
                    </button>
                    <button
                        onClick={() => handleTimeFilter("Evening")}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap appearance-none ${
                            selectedTimeFilter === "Evening"
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        Evening
                    </button>
                    <button
                        onClick={() => handleTimeFilter("All")}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap appearance-none ${
                            selectedTimeFilter === "All"
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        All
                    </button>
                </div>

                {/* Class type filter */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Filter by Class Type</label>
                    <select
                        value={selectedClassType}
                        onChange={(e) => handleClassTypeFilter(e.target.value)}
                        className="w-full border p-2 rounded-lg mt-1 text-sm"
                    >
                        <option value="All">All Classes</option>
                        <option value="CS4">CS4</option>
                        <option value="Box">Box</option>
                        <option value="Ride">Ride</option>
                        <option value="Reform">Reform</option>
                        <option value="Yoga Restore">Yoga Restore</option>
                        <option value="Yoga Flow">Yoga Flow</option>
                        <option value="Hot Pilates">Hot Pilates</option>
                    </select>
                </div>
            </div>

            {/* Class Listings */}
            <div className="p-4 space-y-4">
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((classItem) => {
                        const classCategory = getClassCategory(classItem.className);
                        const classIcon = classIcons[classCategory];
                        const classTimeParts = classItem.START_TIME.split(" ");
                        const classDatePart = classTimeParts[0];
                        const classTimePart = classTimeParts[1] + " "+ classTimeParts[2];
                        if(classItem.classStatusDesc === "In the past"){
                            return null;
                        }
                     
                        return (
                            <Card key={classItem.CLASS_SCHEDULES_ID} className="bg-white" variant="outlined" elevation={0} >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex space-x-3">
                                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50">
                                                {classIcon}
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{classItem.className}</h3>
                                                <p className="text-sm text-gray-500">with {classItem.InstructorName}</p>
                                                <div className="flex items-center mt-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    <span>{classDatePart}</span>
                                                </div>
                                                <div className="flex items-center mt-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>{classTimePart}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-emerald-600">{classItem.classStatusLabel === "Book" ? "Open" : classItem.classStatusLabel}</span>
                                            {classItem.classStatusLabel === "Edit" ? (
                                                <button className="mt-2 px-4 py-2 bg-gray-400 text-white rounded-lg text-sm w-full cursor-not-allowed appearance-none">
                                                    Scheduled
                                                </button>
                                            ) : classItem.classStatusLabel.includes("Waitlist") ? (
                                                <button
                                                    style={{ width: "85%" }}
                                                    onClick={() => handleCardClick(classItem)}
                                                    className="mt-2 px-4 py-2 bg-amber-100 text-amber-900 rounded-lg text-sm hover:bg-amber-200 transition-colors appearance-none"
                                                >
                                                    Join Waitlist
                                                </button>
                                            ) : classItem.classStatusLabel === "Book" ? (
                                                <button
                                                    onClick={() => handleCardClick(classItem)}
                                                    className="mt-2 px-4 py-2 bg-emerald-100 text-emerald-900 rounded-lg text-sm w-full hover:bg-emerald-600 appearance-none"
                                                >
                                                    Book Now
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleCardClick(classItem)}
                                                    className="mt-2 px-4 py-2 bg-gray-200 text-white rounded-lg text-sm cursor-not-allowed appearance-none"
                                                >
                                                    {classItem.classStatusDesc}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No classes available for the selected date and filters.</p>
                        <button className="mt-4 text-gray-800 font-medium appearance-none">
                            View Different Date
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
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
                            <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 appearance-none">
                                Close
                            </button>
                            {modalContent.waitlisted ? (
                                <button onClick={handleAddToWaitlist} className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors appearance-none">
                                    Waitlist
                                </button>
                            ) : (
                                <button onClick={handleBookClass} className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors appearance-none">
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