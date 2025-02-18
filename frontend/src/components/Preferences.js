import React, { useEffect, useState } from "react";
import { saveUserPreferences, getUserPreferences,deleteUserPreference } from "../api";
import { FaTrash } from "react-icons/fa"; // Import delete icon
import { LuTrash2 } from "react-icons/lu";


const DAYS_OF_WEEK = [
    { label: "Mon", value: "Mon" },
    { label: "Tue", value: "Tue" },
    { label: "Wed", value: "Wed" },
    { label: "Thur", value: "Thu" },
    { label: "Fri", value: "Fri" },
    { label: "Sat", value: "Sat" },
    { label: "Sun", value: "Sun" },
];

const Preferences = () => {
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [preferences, setPreferences] = useState([]);

    useEffect(() => {
        async function fetchPreferences() {
            const response = await getUserPreferences();
            if (response.success) {
                setPreferences(response.preferences);
            }
        }
        fetchPreferences();
    }, []);

    const handleDaySelection = (day) => {
        setSelectedDays((prevDays) =>
            prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]
        );
    };

    const handleDeletePreference = async (preferenceId, className, classTime) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete ${className} at ${classTime}?`);
        if (!confirmDelete) return;

        const response = await deleteUserPreference(preferenceId, className, classTime);
        if (response.success) {
            alert("Preference deleted successfully!");
            const updatedPreferences = await getUserPreferences();
            if (updatedPreferences.success) {
                setPreferences(updatedPreferences.preferences);
            }
            // Remove deleted preference from state
            //setPreferences(preferences.filter(pref => pref.id !== preferenceId));
        } else {
            alert("Failed to delete preference.");
        }
    };
    const handleSavePreferences = async () => {
        if (!selectedClass || !selectedTime || selectedDays.length === 0) {
            alert("Please select a class, time, and at least one day.");
            return;
        }
    
        // Prepare preferences as individual entries for each selected day
        const preferencesToSave = selectedDays.map((day) => ({
            className: selectedClass,
            classTime: selectedTime,
            classDay: day,
        }));
    
        const response = await saveUserPreferences(preferencesToSave);
    
        if (response.success) {
            alert("Preferences saved!");
            setSelectedClass(""); // Reset selection
            setSelectedTime("");
            setSelectedDays([]);
    
            // Fetch updated preferences list from the backend
            const updatedResponse = await getUserPreferences();
            if (updatedResponse.success) {
                setPreferences(updatedResponse.preferences);
            }
        } else {
            alert("Failed to save preferences.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 text-center">Auto-Booking Preferences</h2>
            
            <div className="mt-4">
                <label className="block text-gray-700 font-medium">Select Class</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border p-2 rounded-lg mt-2">
                    <option value="">Select Class</option>
                    <option value="CS4">CS4</option>
                    <option value="Box">Box</option>
                    <option value="Ride">Ride</option>
                    <option value="Reform">Reform</option>
                    <option value="Yoga Restore">Yoga Restore</option>
                    <option value="Yoga Flow">Yoga Flow</option>
                    <option value="Hot Pilates">Hot Pilates</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block text-gray-700 font-medium">Select Time</label>
                <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full border p-2 rounded-lg mt-2"/>
            </div>

            <div className="mt-4">
                <label className="block text-gray-700 font-medium">Select Days</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                        <button
                            key={day.value}
                            className={`py-2 border rounded-lg text-sm ${
                                selectedDays.includes(day.value) ? "bg-blue-600 text-white" : "bg-gray-200"
                            }`}
                            onClick={() => handleDaySelection(day.value)}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={handleSavePreferences} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full">
                Save Preferences
            </button>

            <h3 className="text-lg font-semibold mt-6">Your Preferences</h3>
            <ul className="mt-2">
            {Object.values(
                preferences.reduce((acc, pref) => {
                    const key = `${pref.className}-${pref.classTime}`;
                    if (!acc[key]) {
                        acc[key] = {
                            className: pref.className,
                            classTime: pref.classTime,
                            days: [],
                        };
                    }
                    acc[key].days.push(pref.classDays);
                    return acc;
                }, {})
            ).map((pref, index) => (
                <li key={index} className="p-2 border rounded-lg mt-2 bg-gray-100 flex justify-between items-center">
                    <div>
                        <strong>{pref.className}</strong> - {pref.classTime} <br />
                        <span className="text-sm text-gray-600">Days: {pref.days.join(", ")}</span>
                    </div>
                    <a onClick={() => handleDeletePreference(pref.id, pref.className, pref.classTime)} className="text-gray-700 hover:text-red-500 focus:outline-none transition duration-200">
                    <LuTrash2 className="text-2xl" />
                    </a>
                </li>
            ))}
            </ul>
        </div>
    );
};

export default Preferences;