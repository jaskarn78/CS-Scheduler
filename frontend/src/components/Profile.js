import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile } from "../api";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    

    useEffect(() => {
        getUserProfile().then((data) => {
            if (data.Success) {
                const memberData = data.Value.CustomerBasic;
                const memberBarcode = memberData.LoginBarcodeID;
                const memberSinceDate = memberData.MemberSince;
                const formattedJoinDateStr = parseFloat(memberSinceDate.substring(6,memberSinceDate.length-7));
                const formattedJoinDate = new Date(formattedJoinDateStr).toLocaleDateString();
                memberData.JoinDate = formattedJoinDate;
                localStorage.setItem("barCode", memberBarcode);
                setProfile(memberData);
            }else{
                localStorage.removeItem("token"); // Remove token
                localStorage.removeItem("authHeader"); // Remove auth header
                localStorage.removeItem("barCode");
                navigate("/login"); // Redirect to login page
            }
        });
    }, []);

    if (!profile) return <p>Loading profile...</p>;

    return (
        <div className="profile-card">
            <h2>{profile.FirstName} {profile.LastName}</h2>
            <div className='line-item'><strong>Home Club:</strong> {profile.homeClub}</div>
            <div className='line-item'><strong>Member Since:</strong> {profile.JoinDate}</div>
            <div className='line-item'><strong>Email:</strong> {profile.Email}</div>
            <div className='line-item'><strong>Current Status:</strong> {profile.CurrentStatus === 1 ? "Active" : "Inactive"}</div>
        </div>
    );
};

export default Profile;