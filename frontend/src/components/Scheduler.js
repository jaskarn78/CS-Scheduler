import React, { useState, useEffect } from "react";
import { getUpcomingClasses, getBookingSpot, reserveSpot, addToWaitList } from "../api";
import { classIcons, getClassCategory } from "../utils/classIconUtils";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, MapPin } from 'lucide-react';
import dayjs from "dayjs";

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
                if (selectedTimeFilter === "Morning" && classTime >= 5 && classTime < 12) return true;
                if (selectedTimeFilter === "Afternoon" && classTime >= 12 && classTime < 17) return true;
                if (selectedTimeFilter === "Evening" && classTime >= 17 && classTime < 24) return true;
                return false;
            });
        }

        // Sort classes by time
        filtered.sort((a, b) => new Date(a.START_TIME) - new Date(b.START_TIME));

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
        currentDate.setDate(currentDate.getDate() - 1);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
    };

    // Handle next day navigation
    const handleNextDay = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + 1);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
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
                fetchClasses(); // Refresh the class list
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
                fetchClasses(); // Refresh the class list
            } else {
                alert("Failed to join the waitlist. Please try again.");
            }
        } catch (err) {
            console.error("Error adding to the waitlist:", err);
            alert("An error occurred while adding to the waitlist. Please try again.");
        }
    };

    // Format the date display
    const formattedDate = dayjs(selectedDate).format("dddd, MMMM D");
    const isToday = dayjs(selectedDate).isSame(dayjs(), "day");
    const dateDisplay = isToday ? "Today" : formattedDate;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header and Date Selector */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePreviousDay}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                                <h2 className="text-lg font-medium">{dateDisplay}</h2>
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="text-sm text-gray-500 bg-transparent border-none p-0 mt-1"
                            />
                        </div>

                        <button
                            onClick={handleNextDay}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">
                        {/* Time slots quick select */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => handleTimeFilter("Morning")}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                    selectedTimeFilter === "Morning"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Morning
                            </button>
                            <button
                                onClick={() => handleTimeFilter("Afternoon")}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                    selectedTimeFilter === "Afternoon"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Afternoon
                            </button>
                            <button
                                onClick={() => handleTimeFilter("Evening")}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                    selectedTimeFilter === "Evening"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Evening
                            </button>
                            <button
                                onClick={() => handleTimeFilter("All")}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                    selectedTimeFilter === "All"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                All
                            </button>
                        </div>

                        {/* Class type filter */}
                        <div className="sm:w-64">
                            <select
                                value={selectedClassType}
                                onChange={(e) => handleClassTypeFilter(e.target.value)}
                                className="w-full border border-gray-200 p-2 rounded-lg text-sm text-gray-700 bg-gray-50"
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
                </div>
            </div>

            {/* Class Listings */}
            <div className="max-w-6xl mx-auto p-4">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                {filteredClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredClasses.map((classItem) => {
                            const classCategory = getClassCategory(classItem.className);
                            const classIcon = classIcons[classCategory];
                            const classTimeParts = classItem.START_TIME.split(" ");
                            const classTimePart = classTimeParts[1] + " " + classTimeParts[2];
                            if (classItem.classStatusDesc === "In the past") {
                                return null;
                            }

                            return (
                                <div 
                                    key={classItem.CLASS_SCHEDULES_ID} 
                                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full"
                                >
                                    <div className="p-4 h-full flex flex-col">
                                        <div className="flex items-start justify-between flex-grow">
                                            <div className="flex space-x-3">
                                                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                                    {classIcon}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{classItem.className}</h3>
                                                    <p className="text-sm text-gray-500">with {classItem.InstructorName}</p>
                                                    <div className="flex items-center mt-2 text-sm text-gray-600">
                                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                                        <span>{classTimePart}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <span className={`text-sm ${
                                                    classItem.classStatusLabel === "Waitlist" 
                                                        ? "text-amber-600" 
                                                        : classItem.classStatusLabel === "Book" 
                                                            ? "text-emerald-600"
                                                            : "text-gray-500"
                                                }`}>
                                                    {classItem.classStatusLabel === "Book" ? "Open" : classItem.classStatusLabel}
                                                </span>
                                                
                                                {classItem.classStatusLabel === "Edit" ? (
                                                    <button className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm cursor-not-allowed">
                                                        Scheduled
                                                    </button>
                                                ) : classItem.classStatusLabel.includes("Waitlist") ? (
                                                    <button
                                                        onClick={() => handleCardClick(classItem)}
                                                        className="mt-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm hover:bg-amber-200 transition-colors"
                                                    >
                                                        Join Waitlist
                                                    </button>
                                                ) : classItem.classStatusLabel === "Book" ? (
                                                    <button
                                                        onClick={() => handleCardClick(classItem)}
                                                        className="mt-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm hover:bg-emerald-200 transition-colors"
                                                    >
                                                        Book Now
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="mt-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                                                    >
                                                        {classItem.classStatusDesc}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center mt-6 max-w-md mx-auto">
                        <div className="text-gray-400 mb-2">
                            <Calendar className="w-10 h-10 mx-auto opacity-50" />
                        </div>
                        <p className="text-gray-600 mb-4">No classes available for the selected date and filters.</p>
                        <button 
                            onClick={() => {
                                setSelectedClassType("All");
                                setSelectedTimeFilter("All");
                            }}
                            className="text-emerald-600 font-medium hover:text-emerald-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Class Modal */}
            {isModalOpen && modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md mx-auto shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                {classIcons[getClassCategory(modalContent.classType)]}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{modalContent.classType}</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-start">
                                <User className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Instructor</p>
                                    <p className="text-gray-600">{modalContent.instructor}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <Clock className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Class Time</p>
                                    <p className="text-gray-600">{dayjs(modalContent.classTime).format("dddd, MMMM D, YYYY [at] h:mm A")}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="w-4 h-4 mr-2 mt-1 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Description</p>
                                    <p className="text-gray-600">{modalContent.description}</p>
                                </div>
                            </div>
                        </div>

                        {!modalContent.waitlisted && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select a Spot</label>
                                <select
                                    value={selectedSpot}
                                    onChange={handleSpotChange}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50"
                                >
                                    <option value="">Choose a position</option>
                                    {availableSpots.map((spot) => (
                                        <option key={spot.Id} value={spot.Id}>{spot.Text}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button 
                                onClick={closeModal} 
                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            
                            {modalContent.waitlisted ? (
                                <button 
                                    onClick={handleAddToWaitlist} 
                                    className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Join Waitlist
                                </button>
                            ) : (
                                <button 
                                    onClick={handleBookClass} 
                                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    disabled={!selectedSpot}
                                >
                                    Book Class
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