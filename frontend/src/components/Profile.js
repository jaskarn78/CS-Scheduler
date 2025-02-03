import React, { useEffect, useState } from "react";
import { getUserProfile } from "../api";

const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        getUserProfile().then((data) => {
            if (data.Success) {
                setProfile(data.Value.CustomerBasic);
            }
        });
    }, []);

    if (!profile) return <p>Loading profile...</p>;

    return (
        <div className="profile-card">
            <h2>{profile.FirstName} {profile.LastName}</h2>
            <p><strong>Home Club:</strong> {profile.homeClub}</p>
            <p><strong>Member Since:</strong> {new Date(profile.MemberSince).toLocaleDateString()}</p>
            <p><strong>Email:</strong> {profile.Email}</p>
            <p><strong>Phone:</strong> {profile.MobilePhone}</p>
            <p><strong>Address:</strong> {profile.Address}, {profile.City}, {profile.State} {profile.Zipcode}</p>
            <p><strong>Current Status:</strong> {profile.CurrentStatus === 1 ? "Active" : "Inactive"}</p>
        </div>
    );
};

export default Profile;