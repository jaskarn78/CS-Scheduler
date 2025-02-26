import React, { useEffect, useState } from "react";
import { getReservations, cancelReservation } from "../api";
import { addToCalendar } from "../utils/calendarUtils";
import { classIcons, getClassCategory } from "../utils/classIconUtils";
import { Calendar, Clock, MapPin, X, MoreVertical } from "lucide-react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import dayjs from "dayjs"; // ✅ Import dayjs for date formatting

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
        <div className="min-h-screen bg-gray-50 p-3">
            <h2 className="text-lg font-medium text-gray-900 mb-3">My Classes</h2>

            {classes.length === 0 ? (
                <p className="text-gray-600 text-center">No upcoming classes.</p>
            ) : (
                <div className="space-y-2">
                    {classes.map((cls) => {
                        const classCategory = getClassCategory(cls.ClassName);
                        const classDateTime = dayjs(cls.ReserveDate);
                        const isToday = classDateTime.isSame(dayjs(), "day");

                        const formattedDate = isToday
                            ? null // If today, omit the date
                            : classDateTime.format("MMM D, YYYY"); // Format as "Feb 23, 2025"

                        const formattedTime = classDateTime.format("h:mm A"); // Format as "8:30 AM"

                        return (
                            <Card key={cls.ClassReservationID} className="bg-white rounded-lg border border-gray-200 shadow-none">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex space-x-3">
                                            {/* Class Icon */}
                                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50">
                                                {classIcons[classCategory]}
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{cls.ClassName}</h3>
                                                <p className="text-sm text-gray-500">with {cls.InstructorName}</p>
                                                <div className="mt-2 text-sm text-gray-600">
                                                    {formattedDate && (
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            <span>{formattedDate}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        <span>{formattedTime}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        <span>Spot {cls.SpotDisplayNumber || "Waitlisted"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Action Buttons with Labels */}
                                    <div className="mt-4 flex items-center space-x-2">
                                        <button
                                            onClick={() => addToCalendar(cls)}
                                            className="flex items-center justify-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md text-sm w-full hover:bg-emerald-100 transition-colors appearance-none"
                                        >
                                            <Calendar className="w-3 h-3" />
                                            <span>Add to Calendar</span>
                                        </button>
                                        <button
                                            onClick={() => handleCancelReservation(cls.ClassReservationID, cls.TrainingAppointmentID)}
                                            className="flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm w-full hover:bg-red-100 transition-colors appearance-none"
                                        >
                                            <X className="w-3 h-3" />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Classes;