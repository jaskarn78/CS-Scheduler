import React, { useEffect, useState } from "react";
import { getReservations, getUpcomingClasses } from "../api";

const Classes = () => {
    const [classes, setClasses] = useState([]);
    useEffect(() => {
        getReservations().then((data) => {
            console.log(data);
            if (data.Success) {
                setClasses(data.Value);
            }
        });
    }, []);

    return (
        <div className="classes-list">
            <h2>Upcoming Classes</h2>
            {classes.length === 0 ? <p>No upcoming classes.</p> : (
                <ul>
                    {classes.map((cls) => (
                        <li key={cls.ClassReservationID}>
                            <h3>{cls.ClassName}</h3>
                            <p><strong>Instructor:</strong> {cls.InstructorName}</p>
                            <p><strong>Class Time:</strong> {new Date(cls.ReserveDate).toLocaleString()}</p>
                            <p><strong>Spot Number:</strong> {cls.SpotDisplayNumber || "Waitlisted"}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Classes;