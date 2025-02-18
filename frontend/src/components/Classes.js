import React, { useEffect, useState } from "react";
import { getReservations, cancelReservation } from "../api";
import { addToCalendar } from "../utils/calendarUtils";
import { FaCalendarPlus, FaTimesCircle } from "react-icons/fa";
import { classIcons, getClassCategory } from "../utils/classIconUtils";


const Classes = () => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        getReservations().then((data) => {
            if (data.Success) {
                setClasses(data.Value);
            }
        });
    }, []);

  
    const handleCancelReservation = async (classId, trainingId) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this class?");
        if (!confirmCancel) return;

        try {
            const response = await cancelReservation(classId, trainingId);
            if (response.Success) {
                alert("Class reservation canceled successfully!");
                setClasses(classes.filter((cls) => cls.ClassReservationID !== classId));
            } else {
                alert("Failed to cancel class. Please try again.");
            }
        } catch (error) {
            console.error("Error canceling class:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 text-center">My Classes</h2>
    
            {classes.length === 0 ? (
                <p className="text-gray-600 text-center mt-4">No upcoming classes.</p>
            ) : (
                <div className="mt-6 space-y-4">
                    {classes.map((cls) => {
                        const classCategory = getClassCategory(cls.ClassName);
                        return (
                            <div key={cls.ClassReservationID} className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                
                                {/* Icon Section */}
                                <div className="flex-shrink-0">
                                    {classIcons[classCategory]}
                                </div>
    
                                {/* Class Details */}
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800">{cls.ClassName}</h3>
                                    <p className="text-gray-600"><strong>Instructor:</strong> {cls.InstructorName}</p>
                                    <p className="text-gray-600"><strong>Class Time:</strong> {new Date(cls.ReserveDate).toLocaleString()}</p>
                                    <p className="text-gray-600"><strong>Spot Number:</strong> {cls.SpotDisplayNumber || "Waitlisted"}</p>
    
                                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                        {/* Add to Calendar Button */}
                                        <button 
                                            onClick={() => addToCalendar(cls)}
                                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
                                        >
                                            <FaCalendarPlus className="text-white-300" />
                                            Add to Calendar
                                        </button>
                                        
                                        {/* Cancel Button */}
                                        <button 
                                            onClick={() => handleCancelReservation(cls.ClassReservationID, cls.TrainingAppointmentID)}
                                            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 w-full sm:w-auto"
                                        >
                                            <FaTimesCircle className="text-white" />
                                            Cancel Reservation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Classes;