import React, { useEffect, useState } from "react";
import { getReservations } from "../api";

const Classes = () => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        getReservations().then((data) => {
            if (data.Success) {
                setClasses(data.Value);
            }
        });
    }, []);

    const addToCalendar = (cls) => {
        // Convert ReserveDate to UTC and format properly
        const startDate = new Date(cls.ReserveDate);
        const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // Class duration = 45 mins
        const timestamp = new Date(); // Current timestamp

        const formatToICS = (date) => {
            return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; // Format YYYYMMDDTHHmmssZ
        };

        const dtStart = formatToICS(startDate);
        const dtEnd = formatToICS(endDate);
        const dtStamp = formatToICS(timestamp);

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Class: ${cls.ClassName}
DTSTART:${dtStart}
DTEND:${dtEnd}
DTSTAMP:${dtStamp}
UID:${Date.now()}-${cls.ClassName.replace(/\s+/g, "")}
DESCRIPTION:Instructor: ${cls.InstructorName}\\nSpot: ${cls.SpotDisplayNumber || "Waitlisted"}
LOCATION:Club Studio 7440 Elk Grove Blvd, Elk Grove, CA 95757
STATUS:${cls.IsCancelledClass ? "CANCELLED" : "CONFIRMED"}
PRIORITY:0
END:VEVENT
END:VCALENDAR`.replace(/\n/g, "\r\n"); // iOS requires CRLF (`\r\n`)

        // Create a Blob for the .ics file
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${cls.ClassName.replace(/\s+/g, "_")}_Event.ics`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="classes-list">
            <h2>My Classes</h2>
            {classes.length === 0 ? (
                <p>No upcoming classes.</p>
            ) : (
                <ul>
                    {classes.map((cls) => (
                        <li key={cls.ClassReservationID}>
                            <h3>{cls.ClassName}</h3>
                            <div className="line-item"><strong>Instructor:</strong> {cls.InstructorName}</div>
                            <div className="line-item"><strong>Class Time:</strong> {new Date(cls.ReserveDate).toLocaleString()}</div>
                            <div className="line-item"><strong>Spot Number:</strong> {cls.SpotDisplayNumber || "Waitlisted"}</div>

                            {/* Show button ONLY if user is enrolled (not waitlisted) */}
                            {!cls.IsWaitList && (
                                <button 
                                    onClick={() => addToCalendar(cls)}
                                    style={{
                                        marginTop: "10px",
                                        padding: "8px 12px",
                                        backgroundColor: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Add to Calendar 📅
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Classes;