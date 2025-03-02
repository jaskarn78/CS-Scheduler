import React, { useEffect, useState } from "react";
import { saveUserPreferences, getUserPreferences, deleteUserPreference, getAvailableClassTimes, getUserSettings, updateEmailPreference } from "../api";
import { LuTrash2 } from "react-icons/lu";

const DAYS_OF_WEEK = [
    { label: "Sun", value: "Sun", id: 1 },
    { label: "Mon", value: "Mon", id: 2 },
    { label: "Tue", value: "Tue", id: 3 },
    { label: "Wed", value: "Wed", id: 4 },
    { label: "Thur", value: "Thu", id: 5 },
    { label: "Fri", value: "Fri", id: 6 },
    { label: "Sat", value: "Sat", id: 7 },
];

const Preferences = () => {
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedSpot, setSelectedSpot] = useState(""); // Preferred Spot
    const [spotError, setSpotError] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [preferences, setPreferences] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [receiveConfirmationEmails, setReceiveConfirmationEmails] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            const preferencesResponse = await getUserPreferences();
            if (preferencesResponse.success) {
                setPreferences(preferencesResponse.preferences);
            }
            
            // Fetch user settings including email preferences
            try {
                const userSettings = await getUserSettings();
                if (userSettings.success) {
                    setReceiveConfirmationEmails(userSettings.settings.getConfirmEmail);
                }
            } catch (error) {
                console.error("Error fetching user settings:", error);
            }
        }
        fetchUserData();
    }, []);

    // Fetch available times when class and days are selected
    useEffect(() => {
        if (selectedClass && selectedDays.length > 0) {
            fetchAvailableTimes();
        } else {
            setAvailableTimes([]);
            setSelectedTime(""); // Reset time when class or days change
        }
    }, [selectedClass, selectedDays]);

    const fetchAvailableTimes = async () => {
        if (!selectedClass || selectedDays.length === 0) {
            setAvailableTimes([]);
            setErrorMessage("Please select a class and at least one day.");
            return;
        }

        const dayIds = selectedDays.map((day) => DAYS_OF_WEEK.find((d) => d.value === day).id);
        try {
            const response = await getAvailableClassTimes(selectedClass, dayIds);
            if (response.Success && response.Value.length > 0) {
                setAvailableTimes(response.Value.map((classItem) => classItem.StartTime));
                setErrorMessage("");
            } else {
                setAvailableTimes([]);
                setErrorMessage(response.message || `No ${selectedClass} classes available for the selected days.`);
            }
        } catch (error) {
            console.error("Error fetching available times:", error);
            setErrorMessage("Failed to fetch available times.");
        }
    };

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
        } else {
            alert("Failed to delete preference.");
        }
    };

    const handleSpotChange = (value) => {
        // Allow empty value (optional field)
        if (value === "") {
            setSelectedSpot("");
            setSpotError("");
            return;
        }
       
        // Only allow numeric input and ensure it's greater than 0
        if (!/^[1-9]\d*$/.test(value)) {
            // The regex ^[1-9]\d*$ ensures a positive integer starting with 1-9
            if (value === "0") {
                setSpotError("Spot number must be greater than 0");
            } else {
                setSpotError("Please enter numbers only");
            }
            return;
        }
        
        // Valid input
        setSelectedSpot(value);
        setSpotError("");
    };

    const handleSavePreferences = async () => {
        if (!selectedClass || !selectedTime || selectedDays.length === 0) {
            alert("Please select a class, time, and at least one day.");
            return;
        }

        // Validate spot if provided
        if (selectedSpot && parseInt(selectedSpot, 10) <= 0) {
            setSpotError("Spot number must be greater than 0");
            return;
        }

        const preferencesToSave = selectedDays.map((day) => ({
            className: selectedClass,
            classTime: selectedTime,
            preferredSpot: selectedSpot || "Any",
            classDay: day,
        }));

        const response = await saveUserPreferences(preferencesToSave);

        if (response.success) {
            alert("Preferences saved!");
            setSelectedClass("");
            setSelectedTime("");
            setSelectedSpot("");
            setSpotError("");
            setSelectedDays([]);

            const updatedResponse = await getUserPreferences();
            if (updatedResponse.success) {
                setPreferences(updatedResponse.preferences);
            }
        } else {
            alert("Failed to save preferences.");
        }
    };

    const handleEmailPreferenceChange = async (e) => {
        const newValue = e.target.checked;
        setReceiveConfirmationEmails(newValue);
        
        try {
            const response = await updateEmailPreference(newValue);
            if (response.success) {
                alert("Email preferences updated successfully!");
            } else {
                alert("Failed to update email preferences.");
                // Revert to previous state if update failed
                setReceiveConfirmationEmails(!newValue);
            }
        } catch (error) {
            console.error("Error updating email preferences:", error);
            alert("Failed to update email preferences.");
            setReceiveConfirmationEmails(!newValue);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4 bg-white border-b">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Auto-Booking Preferences</h2>

                {/* Email Confirmation Settings */}
                <div className="p-3 bg-gray-50 rounded-lg border mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Notification Settings</h3>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="confirmationEmails"
                            checked={receiveConfirmationEmails}
                            onChange={handleEmailPreferenceChange}
                            className="h-4 w-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <label htmlFor="confirmationEmails" className="ml-2 text-sm text-gray-600">
                            Receive confirmation emails when classes are auto-booked
                        </label>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Select Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full border p-2 rounded-lg mt-1 text-sm"
                    >
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
                    <label className="block text-sm font-medium text-gray-700">Select Days</label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                        {DAYS_OF_WEEK.map((day) => (
                            <button
                                key={day.value}
                                className={`py-2 border rounded-lg text-sm ${
                                    selectedDays.includes(day.value) ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700"
                                } hover:bg-emerald-600 hover:text-white transition-colors`}
                                onClick={() => handleDaySelection(day.value)}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Selection */}
                {availableTimes.length > 0 && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Select Time</label>
                        <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full border p-2 rounded-lg mt-1 text-sm"
                        >
                            <option value="">Select Time</option>
                            {availableTimes.map((time, index) => (
                                <option key={index} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                
                {/* Preferred Spot Selection with strict validation */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Preferred Spot (Optional)</label>
                    <input
                        type="number" 
                        value={selectedSpot}
                        onChange={(e) => handleSpotChange(e.target.value)}
                        onKeyDown={(e) => {
                            // Allow: backspace, delete, tab, escape, enter
                            if ([8, 46, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                // Allow: home, end, left, right
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                            }
                            // Ensure that it's a number and stop the keypress if not
                            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                                (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                            }
                            // Prevent entering 0 as the first character
                            if ((e.keyCode === 48 || e.keyCode === 96) && e.target.value === '') {
                                e.preventDefault();
                            }
                        }}
                        min={1} 
                        max={60}  
                        placeholder="Enter preferred spot number"
                        className={`w-full border p-2 rounded-lg mt-1 text-sm ${
                            spotError ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {spotError && <p className="text-red-500 text-xs mt-1">{spotError}</p>}
                    {/* <p className="text-gray-500 text-xs mt-1">Enter a positive number greater than 0</p> */}
                </div>
                
                <button
                    onClick={handleSavePreferences}
                    className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors w-full text-sm"
                >
                    Save Preferences
                </button>

                <h3 className="text-lg font-semibold mt-6">Your Preferences</h3>
                <ul className="mt-2 space-y-2">
                    {preferences.map((pref, index) => (
                        <li key={index} className="p-2 border rounded-lg bg-gray-50 flex justify-between items-center">
                            <div>
                                <strong className="text-sm">{pref.className}</strong> - {pref.classTime} <br />
                                <span className="text-xs text-gray-600">Days: {pref.classDays}</span> <br />
                                <span className="text-xs text-gray-600">Preferred Spot: {pref.preferredSpot || "Any"}</span>
                            </div>
                            <button
                                onClick={() => handleDeletePreference(pref.id, pref.className, pref.classTime)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <LuTrash2 className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Preferences;