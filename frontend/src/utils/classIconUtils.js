// src/utils/classUtils.js
import React from "react";

// Class icons mapped to their respective images
export const classIcons = {
    "Ride": <img src="/images/stationary-bike.png" alt="Ride" className="w-10 h-10 text-gray-700" />,
    "Box": <img src="/images/boxing-gloves.png" alt="Box" className="w-10 h-10 text-gray-700" />,
    "CS4": <img src="/images/gym.png" alt="CS4" className="w-10 h-10 text-gray-700" />,
    "Reform": <img src="/images/reformer.png" alt="Reform" className="w-10 h-10 text-gray-700" />, 
    "Sweat+": <img src="/images/yoga-mat.png" alt="Sweat+" className="w-10 h-10 text-gray-700" />,
    "Specialty": <img src="/images/trampoline-jumping.png" alt="Specialty" className="w-10 h-10 text-gray-700" />,
    "Hot Pilates": <img src="/images/pilates.png" alt="Hot Pilates" className="w-10 h-10 text-gray-700" />,

};

// Function to categorize class types
export const getClassCategory = (className) => {
    if (className.includes("Yoga")) return "Sweat+";
    if (className.includes("Rebound")) return "Specialty";
    return className; // Use default if no match
};