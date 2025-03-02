import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getUserProfile } from "../api";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getUserProfile()
            .then((data) => {
                if (data.Success) {
                    const memberData = data.Value.CustomerBasic;
                    const formattedJoinDate = new Date(parseFloat(memberData.MemberSince.substring(6, memberData.MemberSince.length - 7)))
                        .toLocaleDateString();

                    const userProfile = {
                        ...memberData,
                        JoinDate: formattedJoinDate,
                    };

                    localStorage.setItem("barCode", memberData.LoginBarcodeID);
                    setProfile(userProfile);
                } else {
                    ["token", "authHeader", "barCode"].forEach((key) => localStorage.removeItem(key));
                    navigate("/login");
                }
            })
            .catch(() => {
                ["token", "authHeader", "barCode"].forEach((key) => localStorage.removeItem(key));
                navigate("/login");
            });
    }, []);

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-40">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 my-4 bg-white border-b">
            {/* Profile Quick View */}
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            >
                <div>
                    <p className="font-medium">
                        {profile.FirstName} {profile.LastName}
                    </p>
                    <p className="text-sm text-gray-500">{profile.homeClub}</p>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                        isProfileExpanded ? "rotate-180" : ""
                    }`}
                />
            </div>

            {/* Expanded Profile Details */}
            {isProfileExpanded && (
                <Card variant="outlined" elevation={0} className="mt-3 pt-3 border-t border-gray-200 rounded-lg shadow-none">
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Member Since</p>
                            <p className="font-medium">{profile.JoinDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Status</p>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    profile.CurrentStatus === 1
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {profile.CurrentStatus === 1 ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Profile;