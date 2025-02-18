import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api";

const Profile = () => {
    const [profile, setProfile] = useState(null);
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
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {profile.FirstName} {profile.LastName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{profile.Email}</p>
            </div>

            <div className="mt-6 space-y-4">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Home Club:</span>
                    <span className="font-medium">{profile.homeClub}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{profile.JoinDate}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${profile.CurrentStatus === 1 ? "text-green-600" : "text-red-500"}`}>
                        {profile.CurrentStatus === 1 ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Profile;