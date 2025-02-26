import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./components/Profile";
import Classes from "./components/Classes";
import UpcomingClassesPage from "./components/Scheduler";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import Preferences from "./components/Preferences";
import './index.css';
function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [authHeader, setAuthHeader] = useState(localStorage.getItem("authHeader") || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedAuthHeader = localStorage.getItem("authHeader");

        if (storedToken) {
            setToken(storedToken);
            setAuthHeader(storedAuthHeader);
        } else {
            setToken(null);
            setAuthHeader(null);
        }

        setIsLoading(false);
    }, []);

    const handleLoginSuccess = (authToken, authHeader) => {
        localStorage.setItem("token", authToken);
        localStorage.setItem("authHeader", authHeader);
        setToken(authToken);
        setAuthHeader(authHeader);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("authHeader");
        setToken(null);
        setAuthHeader(null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <Router>
            {!token ? (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
                <>
                    <Navbar setToken={setToken} />
                    <div className="pt-16 min-h-screen bg-gray-100">
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <div className="container mx-auto p-4">
                                        <Profile />
                                        <Classes />
                                    </div>
                                }
                            />
                            <Route
                                path="/upcoming-classes"
                                element={
                                    <div className="container mx-auto p-4">
                                        <Profile />
                                        <UpcomingClassesPage />
                                    </div>
                                }
                            />
                            <Route
                                path="/my-preferences"
                                element={
                                    <div className="container mx-auto p-4">
                                         <Profile />
                                        <Preferences />
                                    </div>
                                }
                            />
                        </Routes>
                    </div>
                </>
            )}
        </Router>
    );
}

export default App;